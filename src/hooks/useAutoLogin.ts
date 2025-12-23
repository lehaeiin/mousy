import { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const AUTO_LOGIN_KEY = "autoLogin";
const SAVED_EMAIL_KEY = "savedEmail";

export function useAutoLogin() {
  const [autoLogin, setAutoLogin] = useState(false);
  const [savedEmail, setSavedEmail] = useState("");

  useEffect(() => {
    const loadSavedSettings = async () => {
      try {
        const savedAutoLogin = await AsyncStorage.getItem(AUTO_LOGIN_KEY);
        if (savedAutoLogin === "true") {
          setAutoLogin(true);
        }
        const savedEmailValue = await AsyncStorage.getItem(SAVED_EMAIL_KEY);
        if (savedEmailValue) {
          setSavedEmail(savedEmailValue);
        }
      } catch (error) {
        console.error("설정 불러오기 오류:", error);
      }
    };
    loadSavedSettings();
  }, []);

  const saveAutoLoginSettings = async (enabled: boolean, email: string) => {
    try {
      if (enabled) {
        await AsyncStorage.setItem(AUTO_LOGIN_KEY, "true");
        if (email.trim()) {
          await AsyncStorage.setItem(SAVED_EMAIL_KEY, email.trim());
        }
      } else {
        await AsyncStorage.removeItem(AUTO_LOGIN_KEY);
        await AsyncStorage.removeItem(SAVED_EMAIL_KEY);
      }
      setAutoLogin(enabled);
    } catch (error) {
      console.error("자동 로그인 설정 저장 오류:", error);
    }
  };

  return {
    autoLogin,
    savedEmail,
    setAutoLogin: saveAutoLoginSettings,
  };
}





