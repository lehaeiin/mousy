import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import * as Linking from "expo-linking";
import { useAuth } from "../contexts/AuthContext";
import ProjectListScreen from "../screens/projectListScreen";
import ProjectDetailScreen from "../screens/projectDetailScreen";
import ExperimentDetailScreen from "../screens/experimentDetailScreen";
import ExperimentEditScreen from "../screens/experimentEditScreen";
import ProjectEditScreen from "../screens/projectEditScreen";
import LoginScreen from "../screens/LoginScreen";
import ResetPasswordScreen from "../screens/ResetPasswordScreen";
import SearchScreen from "../screens/SearchScreen";
import ProfileScreen from "../screens/ProfileScreen";
import { colors } from "../styles/theme";

export type RootStackParamList = {
  Login: undefined;
  ResetPassword: undefined;
  ProjectList: undefined;
  ProjectDetail: { projectId: string; projectName?: string };
  ProjectEdit: { projectId?: string };
  ExperimentDetail: { experimentId: string };
  ExperimentEdit: { projectId: string; experimentId?: string };
  Search: undefined;
  Profile: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

// Deep Link 구성
// 주의: 인증 관련 deep link (auth/callback, auth/reset-password 등)는
// NavigationContainer가 아닌 AuthContext에서 처리합니다.
const linking = {
  prefixes: ["mousy://", "https://mousy.app"],
  // Supabase URL은 인증 처리용이므로 NavigationContainer에서 제외
  config: {
    screens: {
      Login: "login",
      // ResetPassword는 AuthContext에서 처리하므로 여기서 제외
      ProjectList: "projects",
      ProjectDetail: "projects/:projectId",
      ProjectEdit: "projects/:projectId/edit",
      ExperimentDetail: "experiments/:experimentId",
      ExperimentEdit: "experiments/:experimentId/edit",
    },
  },
  // 인증 관련 deep link는 NavigationContainer에서 처리하지 않음
  getStateFromPath: (path: string, options: any) => {
    // 인증 관련 경로는 NavigationContainer에서 처리하지 않도록
    if (
      path.includes("auth/callback") ||
      path.includes("auth/reset-password") ||
      path.includes("reset-password") ||
      path.includes("recovery") ||
      path.includes("type=recovery") ||
      path.includes("type=signup") ||
      path.includes("type=email") ||
      path.includes("access_token") ||
      path.includes("refresh_token")
    ) {
      return undefined; // NavigationContainer가 처리하지 않음
    }
    // 기본 처리
    const defaultGetStateFromPath = options?.getStateFromPath;
    if (defaultGetStateFromPath) {
      return defaultGetStateFromPath(path, options);
    }
    return undefined;
  },
};

export default function AppNavigator() {
  const { user, loading, resetPasswordUrl } = useAuth();

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer linking={linking}>
      <Stack.Navigator
        screenOptions={{
          headerShown: true,
        }}
        initialRouteName={
          resetPasswordUrl ? "ResetPassword" : user ? "ProjectList" : "Login"
        }
      >
        {resetPasswordUrl ? (
          // 비밀번호 재설정 화면 (user가 없어도 resetPasswordUrl이 있으면 표시)
          <>
            <Stack.Screen
              name="ResetPassword"
              component={ResetPasswordScreen}
              options={{
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="Login"
              component={LoginScreen}
              options={{
                headerShown: false,
              }}
            />
          </>
        ) : user ? (
          // 로그인된 사용자: 메인 앱 화면
          <>
            <Stack.Screen
              name="ProjectList"
              component={ProjectListScreen}
              options={{
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="ProjectDetail"
              component={ProjectDetailScreen}
              options={{
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="ProjectEdit"
              component={ProjectEditScreen}
              options={{
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="ExperimentDetail"
              component={ExperimentDetailScreen}
              options={{
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="ExperimentEdit"
              component={ExperimentEditScreen}
              options={{
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="Search"
              component={SearchScreen}
              options={{
                title: "검색",
              }}
            />
            <Stack.Screen
              name="Profile"
              component={ProfileScreen}
              options={{
                headerShown: false,
              }}
            />
          </>
        ) : (
          // 로그인되지 않은 사용자: 로그인 화면
          <>
            <Stack.Screen
              name="Login"
              component={LoginScreen}
              options={{
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="ResetPassword"
              component={ResetPasswordScreen}
              options={{
                headerShown: false,
              }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.background.white,
  },
});
