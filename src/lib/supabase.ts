import { createClient } from "@supabase/supabase-js";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Database } from "./database.types";

// 환경 변수에서 Supabase 설정 가져오기
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || "";

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    "⚠️ Supabase 환경 변수가 설정되지 않았습니다. .env 파일을 확인하세요."
  );
}

// Supabase 클라이언트 생성
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
    // 리프레시 토큰 오류 시 자동으로 세션 정리
    storageKey: "supabase.auth.token",
  },
});

// 인증 상태 변경 리스너 - 리프레시 토큰 오류 처리
supabase.auth.onAuthStateChange((event, session) => {
  // 토큰 갱신 실패 시 세션 정리
  if (event === "TOKEN_REFRESHED" && !session) {
    supabase.auth.signOut().catch((error) => {
      console.error("세션 정리 중 오류:", error);
    });
  }
});


