import { supabase } from "../lib/supabase";
import type { Session, User } from "@supabase/supabase-js";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";
import * as Linking from "expo-linking";

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || "";
const resetPasswordWebUrl = process.env.EXPO_PUBLIC_RESET_PASSWORD_WEB_URL || "";

export interface AuthResponse {
  user: User | null;
  session: Session | null;
  error: Error | null;
}

/**
 * 이메일과 비밀번호로 로그인
 */
/**
 * 에러 메시지를 사용자 친화적인 한국어로 변환
 */
function getErrorMessage(error: any): string {
  const errorMessage = error?.message || "";

  if (errorMessage.includes("Invalid login credentials")) {
    return "이메일 또는 비밀번호가 올바르지 않습니다.";
  }
  if (errorMessage.includes("Email not confirmed")) {
    return "이메일 인증이 완료되지 않았습니다. 이메일을 확인해주세요.";
  }
  if (errorMessage.includes("Too many requests")) {
    return "너무 많은 시도가 있었습니다. 잠시 후 다시 시도해주세요.";
  }
  if (errorMessage.includes("User not found")) {
    return "존재하지 않는 사용자입니다.";
  }
  if (errorMessage.includes("Invalid email")) {
    return "올바른 이메일 형식이 아닙니다.";
  }
  if (errorMessage.includes("Password")) {
    return "비밀번호가 올바르지 않습니다.";
  }

  return errorMessage || "로그인에 실패했습니다. 다시 시도해주세요.";
}

export async function signInWithEmail(
  email: string,
  password: string
): Promise<AuthResponse> {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      // 사용자 친화적인 에러 메시지로 변환
      const friendlyError = new Error(getErrorMessage(error));
      friendlyError.name = error.name;
      return {
        user: null,
        session: null,
        error: friendlyError,
      };
    }

    return {
      user: data.user,
      session: data.session,
      error: null,
    };
  } catch (error: any) {
    const friendlyError = new Error(getErrorMessage(error));
    return {
      user: null,
      session: null,
      error: friendlyError,
    };
  }
}

/**
 * 이메일 존재 여부 확인
 * 보안을 위해 더미 비밀번호로 로그인 시도하여 확인
 */
async function checkEmailExists(email: string): Promise<boolean> {
  try {
    // 더미 비밀번호로 로그인 시도
    // 이메일이 존재하면 "Invalid login credentials" 에러 발생
    // 이메일이 없으면 "User not found" 또는 다른 에러 발생
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password: "dummy_check_email_exists_12345!@#$%",
    });

    // "Invalid login credentials"는 이메일이 존재하지만 비밀번호가 틀린 경우
    // "Email not confirmed"도 이메일이 존재하는 경우
    if (
      error?.message?.includes("Invalid login credentials") ||
      error?.message?.includes("Email not confirmed") ||
      error?.message?.includes("Invalid password")
    ) {
      return true; // 이메일이 존재함
    }

    // "User not found" 또는 다른 에러는 이메일이 없는 경우
    return false;
  } catch (error) {
    // 에러 발생 시 안전하게 false 반환 (회원가입 허용)
    // 실제로는 이메일이 존재할 수 있지만, 보안상 회원가입을 허용
    return false;
  }
}

/**
 * 이메일과 비밀번호로 회원가입
 * 기존에 등록된 이메일은 사용할 수 없습니다.
 */
export async function signUpWithEmail(
  email: string,
  password: string
): Promise<AuthResponse> {
  try {
    // 이메일 인증 후 리다이렉트될 URL 설정
    const emailRedirectToRaw =
      Platform.OS === "web"
        ? `${supabaseUrl}/auth/v1/callback`
        : Linking.createURL("auth/callback");
    const emailRedirectTo = encodeURIComponent(emailRedirectToRaw);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo,
      },
    });

    if (error) {
      // 에러 메시지를 한국어로 변환
      let errorMessage = error.message;

      // 이메일 중복 관련 에러 메시지 처리 (Supabase의 실제 에러 코드와 메시지 확인)
      const errorCode = (error as any)?.code;
      const errorStatus = (error as any)?.status;

      if (
        error.message.includes("User already registered") ||
        error.message.includes("email address is already registered") ||
        error.message.includes("already exists") ||
        error.message.includes("already registered") ||
        errorCode === "signup_disabled" ||
        errorStatus === 422 ||
        (errorMessage.toLowerCase().includes("already") &&
          !errorMessage.toLowerCase().includes("email not confirmed"))
      ) {
        errorMessage =
          "이미 사용 중인 이메일입니다. 다른 이메일을 사용해주세요.";
      } else if (error.message.includes("Invalid email")) {
        errorMessage = "올바른 이메일 형식이 아닙니다.";
      } else if (error.message.includes("Password")) {
        errorMessage = "비밀번호는 최소 6자 이상이어야 합니다.";
      } else if (error.message.includes("Email rate limit")) {
        errorMessage =
          "이메일 전송 횟수가 초과되었습니다. 잠시 후 다시 시도해주세요.";
      }

      return {
        user: null,
        session: null,
        error: new Error(errorMessage),
      };
    }

    // 이메일 인증이 활성화되어 있으면 user가 null일 수 있지만, 이는 정상입니다.
    // 이메일 인증 링크를 클릭하면 user가 생성됩니다.
    // error가 없으면 회원가입이 성공한 것으로 간주합니다.
    return {
      user: data.user,
      session: data.session,
      error: null,
    };
  } catch (error: any) {
    let errorMessage = "회원가입에 실패했습니다. 다시 시도해주세요.";

    // 이메일 중복 관련 에러 처리
    if (
      error?.message?.includes("already registered") ||
      error?.message?.includes("already exists") ||
      (error?.message?.toLowerCase().includes("already") &&
        !error?.message?.toLowerCase().includes("email not confirmed"))
    ) {
      errorMessage = "이미 사용 중인 이메일입니다. 다른 이메일을 사용해주세요.";
    }

    return {
      user: null,
      session: null,
      error: new Error(errorMessage),
    };
  }
}

/**
 * 로컬 스토리지의 사용자 데이터 정리
 */
async function clearUserData(): Promise<void> {
  try {
    const keysToRemove = [
      "experiments",
      "projects",
      "@mousy:upload_queue",
    ];

    // 모든 키 삭제
    await Promise.all(keysToRemove.map((key) => AsyncStorage.removeItem(key)));

    // 모든 키를 가져와서 사용자 데이터 관련 키만 삭제
    const allKeys = await AsyncStorage.getAllKeys();
    const userDataKeys = allKeys.filter(
      (key) =>
        key.startsWith("experiment_") ||
        key.startsWith("project_") ||
        key.startsWith("@mousy:")
    );

    if (userDataKeys.length > 0) {
      await AsyncStorage.multiRemove(userDataKeys);
    }
  } catch (error) {
    // 정리 실패해도 로그아웃은 진행
  }
}

/**
 * 로그아웃
 */
export async function signOut(): Promise<{ error: Error | null }> {
  try {
    // 먼저 로컬 데이터 정리
    await clearUserData();

    // Supabase 세션 로그아웃
    const { error } = await supabase.auth.signOut();
    return { error: error as Error | null };
  } catch (error) {
    return { error: error as Error };
  }
}

/**
 * 현재 세션 가져오기
 */
export async function getCurrentSession(): Promise<Session | null> {
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      console.error("세션 가져오기 오류:", error);

      // 리프레시 토큰 오류인 경우 세션 정리
      if (
        error.message?.includes("Invalid Refresh Token") ||
        error.message?.includes("Refresh Token Not Found") ||
        error.message?.includes("JWT expired")
      ) {
        // 세션 정리 (로그아웃)
        await supabase.auth.signOut();
        return null;
      }

      return null;
    }
    return data.session;
  } catch (error: any) {
    console.error("세션 가져오기 오류:", error);

    // 리프레시 토큰 오류인 경우 세션 정리
    if (
      error?.message?.includes("Invalid Refresh Token") ||
      error?.message?.includes("Refresh Token Not Found") ||
      error?.message?.includes("JWT expired")
    ) {
      try {
        await supabase.auth.signOut();
      } catch (signOutError) {
        console.error("세션 정리 중 오류:", signOutError);
      }
    }

    return null;
  }
}

/**
 * 현재 사용자 가져오기
 */
export async function getCurrentUser(): Promise<User | null> {
  try {
    // 먼저 세션 확인 - 세션이 없으면 사용자도 없음
    const session = await getCurrentSession();
    if (!session) {
      return null;
    }

    const { data, error } = await supabase.auth.getUser();
    if (error) {
      // AuthSessionMissingError는 정상적인 상황일 수 있음 (로그인하지 않은 상태)
      if (
        error.message?.includes("session") ||
        error.message?.includes("Auth session missing")
      ) {
        return null;
      }

      // 리프레시 토큰 오류인 경우 세션 정리
      if (
        error.message?.includes("Invalid Refresh Token") ||
        error.message?.includes("Refresh Token Not Found") ||
        error.message?.includes("JWT expired")
      ) {
        try {
          await supabase.auth.signOut();
        } catch (signOutError) {
          console.error("세션 정리 중 오류:", signOutError);
        }
        return null;
      }

      console.error("사용자 가져오기 오류:", error);
      return null;
    }
    return data.user;
  } catch (error: any) {
    // AuthSessionMissingError는 정상적인 상황일 수 있음 (로그인하지 않은 상태)
    if (
      error?.message?.includes("session") ||
      error?.message?.includes("Auth session missing")
    ) {
      return null;
    }

    // 리프레시 토큰 오류인 경우 세션 정리
    if (
      error?.message?.includes("Invalid Refresh Token") ||
      error?.message?.includes("Refresh Token Not Found") ||
      error?.message?.includes("JWT expired")
    ) {
      try {
        await supabase.auth.signOut();
      } catch (signOutError) {
        console.error("세션 정리 중 오류:", signOutError);
      }
      return null;
    }

    console.error("사용자 가져오기 오류:", error);
    return null;
  }
}

/**
 * 카카오톡으로 로그인
 * 이 함수는 OAuth URL을 반환하며, 실제 브라우저 열기는 AuthContext에서 처리합니다.
 */
export async function signInWithKakao(): Promise<{
  url: string | null;
  error: Error | null;
}> {
  try {
    // 플랫폼별 리다이렉트 URL 설정
    let redirectTo: string;

    if (Platform.OS === "web") {
      // 웹 환경: 현재 페이지의 루트 URL 사용 (query string 없이)
      // 일반 HTTP/HTTPS URL은 인코딩 불필요
      if (typeof window !== "undefined") {
        redirectTo = window.location.origin + window.location.pathname;
        // pathname이 루트가 아니면 루트로 설정
        if (redirectTo.endsWith("/") === false && !redirectTo.includes("?")) {
          redirectTo = window.location.origin + "/";
        }
      } else {
        // 서버 사이드 렌더링 환경
        redirectTo = `${supabaseUrl}/auth/v1/callback`;
      }
    } else {
      const redirectToRaw = Linking.createURL("auth/callback");
      redirectTo = encodeURIComponent(redirectToRaw);
    }

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "kakao",
      options: {
        redirectTo,
      },
    });

    if (error) {
      return {
        url: null,
        error: error as Error,
      };
    }

    return {
      url: data.url,
      error: null,
    };
  } catch (error) {
    return {
      url: null,
      error: error as Error,
    };
  }
}

/**
 * OAuth URL로부터 세션 가져오기
 * Deep Link 콜백에서 호출됩니다.
 */
export async function getSessionFromUrl(url: string): Promise<Session | null> {
  try {
    // URL 파싱 (hash fragment 또는 query string 모두 확인)
    let hashParams: URLSearchParams;
    let queryParams: URLSearchParams;

    const hashIndex = url.indexOf("#");
    const queryIndex = url.indexOf("?");

    if (hashIndex !== -1) {
      hashParams = new URLSearchParams(url.substring(hashIndex + 1));
    } else {
      hashParams = new URLSearchParams();
    }

    if (queryIndex !== -1) {
      const queryString =
        hashIndex !== -1 && hashIndex > queryIndex
          ? url.substring(queryIndex + 1, hashIndex)
          : url.substring(queryIndex + 1);
      queryParams = new URLSearchParams(queryString);
    } else {
      queryParams = new URLSearchParams();
    }

    // hash나 query string에서 토큰 추출 (hash 우선)
    const accessToken =
      hashParams.get("access_token") || queryParams.get("access_token");
    const refreshToken =
      hashParams.get("refresh_token") || queryParams.get("refresh_token");

    if (accessToken && refreshToken) {
      const { data, error } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      });

      if (error) {
        console.error("세션 설정 오류:", error);
        return null;
      }

      return data.session;
    }

    return null;
  } catch (error) {
    console.error("URL에서 세션 가져오기 오류:", error);
    return null;
  }
}

/**
 * 비밀번호 재설정 이메일 전송
 * 이메일 링크 클릭 시 웹 페이지로 리다이렉트되어 비밀번호를 재설정할 수 있습니다.
 * 표준 Supabase 플로우: 웹 페이지에서 PASSWORD_RECOVERY 이벤트를 처리합니다.
 */
export async function resetPasswordForEmail(
  email: string
): Promise<{ error: Error | null }> {
  try {
    if (!supabaseUrl) {
      return {
        error: new Error(
          "Supabase URL이 설정되지 않았습니다. 환경 변수를 확인해주세요."
        ),
      };
    }

    // 웹 페이지 URL이 설정되지 않았으면 에러
    if (!resetPasswordWebUrl) {
      return {
        error: new Error(
          "비밀번호 재설정 웹 페이지 URL이 설정되지 않았습니다.\n\n" +
            "환경 변수 EXPO_PUBLIC_RESET_PASSWORD_WEB_URL을 설정해주세요.\n" +
            "예: https://reset-password-xxxx.vercel.app"
        ),
      };
    }

    // redirectTo는 비밀번호 재설정 웹 페이지 URL입니다.
    // 표준 Supabase 플로우: 웹 페이지에서 처리
    const redirectTo = resetPasswordWebUrl;

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectTo,
    });

    if (error) {
      // "requested path is invalid" 또는 "Verify requires a verification type" 오류인 경우
      const errorMessage = error.message || "";
      const errorCode = (error as any)?.code;
      if (
        errorMessage.includes("invalid") ||
        errorMessage.includes("path") ||
        errorMessage.includes("verification type") ||
        errorCode === 400 ||
        errorCode === "validation_failed"
      ) {
        return {
          error: new Error(
            "비밀번호 재설정 링크 생성에 실패했습니다.\n\n" +
              "Supabase 대시보드에서 다음을 확인해주세요:\n" +
              "1. Authentication > URL Configuration > Redirect URLs에\n" +
              `   ${resetPasswordWebUrl} 추가\n` +
              "2. Settings > API > Site URL 확인\n\n" +
              "Redirect URLs에 위 URL을 추가한 후 다시 시도해주세요."
          ),
        };
      }
      return { error: error as Error };
    }

    return { error: null };
  } catch (error) {
    return { error: error as Error };
  }
}

/**
 * 비밀번호 재설정 URL에서 세션 설정
 * 이메일 링크에서 앱으로 돌아올 때 호출됩니다.
 */
export async function setSessionFromResetPasswordUrl(
  url: string
): Promise<Session | null> {
  try {
    // Expo Linking.parse를 사용하여 URL 파싱 (fragment 지원)
    let parsedUrl: any;
    try {
      // expo-linking의 parse 함수 사용 시도
      parsedUrl = Linking.parse(url);
    } catch (parseError) {
      parsedUrl = null;
    }

    // URL에서 access_token과 refresh_token 추출
    // hash fragment (# 이후) 또는 query string (? 이후) 모두 확인
    let hashParams: URLSearchParams;
    let queryParams: URLSearchParams;

    // expo-linking의 fragment 사용 시도
    if (parsedUrl?.fragment) {
      hashParams = new URLSearchParams(parsedUrl.fragment);
    } else {
      // 수동으로 hash fragment 파싱
      const hashIndex = url.indexOf("#");
      if (hashIndex !== -1) {
        const hashString = url.substring(hashIndex + 1);
        hashParams = new URLSearchParams(hashString);
      } else {
        hashParams = new URLSearchParams();
      }
    }

    // query string 파싱
    const queryIndex = url.indexOf("?");
    if (queryIndex !== -1) {
      const hashIndex = url.indexOf("#");
      const queryString =
        hashIndex !== -1 && hashIndex > queryIndex
          ? url.substring(queryIndex + 1, hashIndex)
          : url.substring(queryIndex + 1);
      queryParams = new URLSearchParams(queryString);
    } else {
      queryParams = new URLSearchParams();
    }

    // hash나 query string에서 토큰 추출 (hash 우선)
    const accessToken =
      hashParams.get("access_token") || queryParams.get("access_token");
    const refreshToken =
      hashParams.get("refresh_token") || queryParams.get("refresh_token");
    const type = hashParams.get("type") || queryParams.get("type");

    // 비밀번호 재설정 타입인지 확인 (type이 recovery이거나, reset-password URL에 토큰이 있는 경우)
    if (accessToken && refreshToken) {
      // type이 recovery이거나, URL에 recovery/reset-password가 포함된 경우
      const isRecoveryType =
        type === "recovery" ||
        url.includes("reset-password") ||
        url.includes("recovery");

      if (isRecoveryType) {
        const { data, error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });

        if (error) {
          console.error("비밀번호 재설정 세션 설정 오류:", error);
          return null;
        }

        return data.session;
      } else {
        // recovery 타입이 아니어도 토큰이 있으면 세션 설정 시도
        const { data, error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });

        if (error) {
          console.error("세션 설정 오류:", error);
          return null;
        }

        return data.session;
      }
    }

    return null;
  } catch (error) {
    console.error("비밀번호 재설정 URL 처리 오류:", error);
    return null;
  }
}

/**
 * 비밀번호 업데이트
 */
export async function updatePassword(
  newPassword: string
): Promise<{ error: Error | null }> {
  try {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      return { error: error as Error };
    }

    return { error: null };
  } catch (error) {
    return { error: error as Error };
  }
}
