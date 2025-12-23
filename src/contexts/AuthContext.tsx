import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
} from "react";
import type { Session, User } from "@supabase/supabase-js";
import { Platform } from "react-native";
import * as Linking from "expo-linking";
import * as WebBrowser from "expo-web-browser";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  getCurrentSession,
  getCurrentUser,
  signInWithEmail,
  signOut as authSignOut,
  signUpWithEmail,
  signInWithKakao,
  getSessionFromUrl,
  resetPasswordForEmail,
  setSessionFromResetPasswordUrl,
  updatePassword as authUpdatePassword,
} from "../services/authService";
import { supabase } from "../lib/supabase";

// WebBrowser가 완료되면 닫히도록 설정
WebBrowser.maybeCompleteAuthSession();

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string) => Promise<{ error: Error | null }>;
  signInWithKakao: () => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: Error | null }>;
  updatePassword: (newPassword: string) => Promise<{ error: Error | null }>;
  resetPasswordUrl: string | null;
  setResetPasswordUrl: (url: string | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [resetPasswordUrl, setResetPasswordUrl] = useState<string | null>(null);
  // useRef로 최신 resetPasswordUrl 값을 참조 (클로저 문제 해결)
  const resetPasswordUrlRef = useRef<string | null>(null);

  useEffect(() => {
    // 초기 세션 확인
    checkSession();

    // 웹 환경에서 URL hash fragment로 인증 처리
    if (Platform.OS === "web" && typeof window !== "undefined") {
      // URL hash에서 토큰 추출 (Supabase는 #access_token=... 형태로 리다이렉트)
      const hash = window.location.hash.substring(1);
      if (hash) {
        const hashParams = new URLSearchParams(hash);
        const accessToken = hashParams.get("access_token");
        const refreshToken = hashParams.get("refresh_token");

        if (accessToken && refreshToken) {
          supabase.auth
            .setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            })
            .then(({ data, error }) => {
              if (!error && data.session) {
                setSession(data.session);
                setUser(data.session.user);
                // URL에서 hash 제거
                window.history.replaceState(
                  {},
                  document.title,
                  window.location.pathname
                );
              }
            });
        }
      }
    }

    // 인증 상태 변경 리스너
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      // 표준 Supabase 플로우: PASSWORD_RECOVERY 이벤트 발생 시 resetPasswordUrl 설정
      if (event === "PASSWORD_RECOVERY") {
        // PASSWORD_RECOVERY 이벤트가 발생하면 비밀번호 재설정 화면으로 이동
        const recoveryUrl = "mousy://auth/reset-password";
        setResetPasswordUrl(recoveryUrl);
        resetPasswordUrlRef.current = recoveryUrl;
        if (session) {
          setSession(session);
          setUser(session.user);
        }
        setLoading(false);
        return;
      }

      // INITIAL_SESSION 이벤트는 초기화 이벤트이므로 resetPasswordUrl을 보존
      if (event === "INITIAL_SESSION") {
        // useRef로 최신 resetPasswordUrl 값을 참조 (클로저 문제 해결)
        const currentResetPasswordUrl = resetPasswordUrlRef.current;
        if (session) {
          setSession(session);
          setUser(session.user);
        } else {
          setSession(null);
          setUser(null);
        }
        // resetPasswordUrl이 있으면 보존
        if (currentResetPasswordUrl) {
          setResetPasswordUrl(currentResetPasswordUrl);
        }
        setLoading(false);
        return; // resetPasswordUrl을 보존하기 위해 early return
      }

      // 리프레시 토큰 오류가 발생한 경우 세션 정리
      if (event === "SIGNED_OUT" || !session) {
        setSession(null);
        setUser(null);

        // 로그아웃 시 로컬 데이터 정리
        if (event === "SIGNED_OUT") {
          try {
            const keysToRemove = [
              "experiments",
              "projects",
              "@mousy:upload_queue",
            ];
            const allKeys = await AsyncStorage.getAllKeys();
            const userDataKeys = allKeys.filter(
              (key) =>
                key.startsWith("experiment_") ||
                key.startsWith("project_") ||
                key.startsWith("@mousy:")
            );
            await AsyncStorage.multiRemove([...keysToRemove, ...userDataKeys]);
          } catch (error) {
            // 정리 실패해도 로그아웃은 진행
          }
        }
      } else {
        // 로그인 시 이전 사용자의 데이터가 남아있지 않도록 확인
        // (이미 RLS로 필터링되지만, 로컬 캐시는 정리)
        if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
          const currentUserId = session.user.id;
          const lastUserId = await AsyncStorage.getItem("@mousy:last_user_id");

          // 다른 사용자로 로그인한 경우 로컬 데이터 정리
          if (lastUserId && lastUserId !== currentUserId) {
            try {
              const keysToRemove = [
                "experiments",
                "projects",
                "@mousy:upload_queue",
              ];
              const allKeys = await AsyncStorage.getAllKeys();
              const userDataKeys = allKeys.filter(
                (key) =>
                  key.startsWith("experiment_") ||
                  key.startsWith("project_") ||
                  key.startsWith("@mousy:")
              );
              await AsyncStorage.multiRemove([
                ...keysToRemove,
                ...userDataKeys,
              ]);
            } catch (error) {
              // 정리 실패해도 로그인은 진행
            }
          }

          // 현재 사용자 ID 저장
          await AsyncStorage.setItem("@mousy:last_user_id", currentUserId);
        }

        setSession(session);
        setUser(session.user);
      }
      setLoading(false);
    });

    // Deep Link 리스너 (OAuth 콜백, 이메일 인증, 비밀번호 재설정 처리)
    const handleDeepLink = async (event: { url: string }) => {
      const url = event.url;

      // 일반적인 앱 시작 URL 패턴 제외 (예: exp://127.0.0.1:8081, exp://192.168.x.x:8081 등)
      const isGeneralAppUrl =
        url === "exp://" ||
        /^exp:\/\/[\d.]+:\d+$/.test(url) ||
        /^exp:\/\/localhost/.test(url) ||
        url === "mousy://" ||
        (url.startsWith("exp://") && !url.includes("/") && !url.includes("?"));

      if (isGeneralAppUrl) {
        // 일반적인 앱 시작 URL은 무시
        return;
      }

      // 이메일 인증 링크 처리 (type=signup 또는 type=email)
      if (
        url.includes("type=signup") ||
        url.includes("type=email") ||
        url.includes("type=email_change") ||
        (url.includes("auth/callback") &&
          (url.includes("access_token") || url.includes("refresh_token")))
      ) {
        const session = await getSessionFromUrl(url);
        if (session) {
          setSession(session);
          setUser(session.user);
        } else {
          // URL에서 직접 토큰 추출 시도
          try {
            const urlObj = new URL(url);
            const hashParams = new URLSearchParams(urlObj.hash.substring(1));
            const accessToken = hashParams.get("access_token");
            const refreshToken = hashParams.get("refresh_token");

            if (accessToken && refreshToken) {
              const { data, error } = await supabase.auth.setSession({
                access_token: accessToken,
                refresh_token: refreshToken,
              });

              if (!error && data.session) {
                setSession(data.session);
                setUser(data.session.user);
              }
            }
          } catch (error) {
            console.error("이메일 인증 링크 처리 오류:", error);
          }
        }
        return;
      }

      if (url.includes("auth/callback")) {
        // OAuth 콜백 처리
        const session = await getSessionFromUrl(url);
        if (session) {
          setSession(session);
          setUser(session.user);
        }
        return;
      }

      // 비밀번호 재설정 링크 처리 (명시적인 재설정 관련 키워드가 있을 때만)
      const isPasswordResetUrl =
        url.includes("auth/reset-password") ||
        url.includes("reset-password") ||
        url.includes("type=recovery") ||
        (url.includes("recovery") &&
          (url.includes("access_token") || url.includes("refresh_token")));

      if (isPasswordResetUrl) {
        // 비밀번호 재설정 링크 처리
        const session = await setSessionFromResetPasswordUrl(url);
        if (session) {
          setSession(session);
          setUser(session.user);
          setResetPasswordUrl(url);
          resetPasswordUrlRef.current = url; // ref에도 저장
        } else if (
          url.includes("access_token") ||
          url.includes("refresh_token") ||
          url.includes("type=recovery")
        ) {
          // 세션이 생성되지 않았지만 명시적인 재설정 토큰/키워드가 있으면 URL 저장
          setResetPasswordUrl(url);
          resetPasswordUrlRef.current = url; // ref에도 저장
        }
        // 세션도 없고 토큰도 없으면 일반 URL로 처리하지 않음
      }
    };

    // 앱이 이미 열려있을 때의 Deep Link 처리
    Linking.getInitialURL().then((initialUrl) => {
      if (initialUrl) {
        handleDeepLink({ url: initialUrl });
      }
    });

    // Deep Link 리스너 등록
    const linkingSubscription = Linking.addEventListener("url", (event) => {
      handleDeepLink(event);
    });

    return () => {
      subscription.unsubscribe();
      linkingSubscription.remove();
    };
  }, []);

  const checkSession = async () => {
    try {
      const currentSession = await getCurrentSession();
      setSession(currentSession);

      // 세션이 있을 때만 사용자 정보 가져오기
      if (currentSession) {
        const currentUser = await getCurrentUser();
        setUser(currentUser);
      } else {
        setUser(null);
      }
    } catch (error: any) {
      console.error("세션 확인 오류:", error);

      // 리프레시 토큰 오류인 경우 세션 정리
      if (
        error?.message?.includes("Invalid Refresh Token") ||
        error?.message?.includes("Refresh Token Not Found") ||
        error?.message?.includes("JWT expired")
      ) {
        try {
          await authSignOut();
        } catch (signOutError) {
          console.error("세션 정리 중 오류:", signOutError);
        }
      }
      setSession(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    const result = await signInWithEmail(email, password);
    if (result.error) {
      return { error: result.error };
    }
    setUser(result.user);
    setSession(result.session);
    return { error: null };
  };

  const signUp = async (email: string, password: string) => {
    const result = await signUpWithEmail(email, password);
    if (result.error) {
      return { error: result.error };
    }

    // 회원가입 후 세션이 있으면 바로 로그인 처리
    if (result.session) {
      setUser(result.user);
      setSession(result.session);
    } else if (result.user) {
      // 세션이 없지만 사용자가 있으면 (이메일 인증 필요 또는 세션 생성 대기)
      // 세션을 다시 확인해봅니다
      setUser(result.user);

      // 세션을 즉시 다시 확인 (Supabase가 세션을 생성하는데 시간이 걸릴 수 있음)
      const checkSession = async () => {
        const session = await getCurrentSession();
        if (session) {
          setSession(session);
          const user = await getCurrentUser();
          if (user) {
            setUser(user);
          }
        } else {
          // 세션이 없으면 잠시 후 다시 확인
          setTimeout(checkSession, 500);
        }
      };

      // 즉시 확인
      checkSession();
    } else {
      // 사용자도 세션도 없으면
      setUser(null);
      setSession(null);
    }

    return { error: null };
  };

  const handleSignInWithKakao = async () => {
    try {
      const result = await signInWithKakao();

      if (result.error) {
        return { error: result.error };
      }

      if (!result.url) {
        return { error: new Error("OAuth URL을 가져올 수 없습니다.") };
      }

      // 웹 환경에서는 직접 리다이렉트
      if (Platform.OS === "web" && typeof window !== "undefined") {
        window.location.href = result.url;
        return { error: null };
      }

      // 모바일 환경: 브라우저로 OAuth URL 열기
      const redirectTo = `mousy://auth/callback`;
      const authResult = await WebBrowser.openAuthSessionAsync(
        result.url,
        redirectTo
      );

      if (authResult.type === "success" && authResult.url) {
        // 콜백 URL에서 세션 가져오기
        const session = await getSessionFromUrl(authResult.url);
        if (session) {
          setSession(session);
          setUser(session.user);
          return { error: null };
        }
      }

      if (authResult.type === "cancel") {
        return { error: new Error("로그인이 취소되었습니다.") };
      }

      return { error: new Error("카카오 로그인에 실패했습니다.") };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signOut = async () => {
    await authSignOut();
    setUser(null);
    setSession(null);
  };

  const resetPassword = async (email: string) => {
    const result = await resetPasswordForEmail(email);
    return result;
  };

  const updatePassword = async (newPassword: string) => {
    const result = await authUpdatePassword(newPassword);
    if (!result.error) {
      // 비밀번호 변경 후 세션 새로고침
      const currentSession = await getCurrentSession();
      setSession(currentSession);
      if (currentSession) {
        const currentUser = await getCurrentUser();
        setUser(currentUser);
      }
    }
    return result;
  };

  const value: AuthContextType = {
    user,
    session,
    loading,
    signIn,
    signUp,
    signInWithKakao: handleSignInWithKakao,
    signOut,
    resetPassword,
    updatePassword,
    resetPasswordUrl,
    setResetPasswordUrl,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
