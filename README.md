# 🐀 mousy

바이오 연구실을 위한 실험 노트 앱

## 주요 기능

- 실험 노트 작성 (텍스트, 사진, 파일)
- 프로토콜 템플릿
- 오프라인 우선 구조
- 검색 및 태그 필터링

## 기술 스택

- React Native (Expo) + TypeScript
- Supabase (PostgreSQL)

## 시작하기

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm start
```

## 환경 변수 설정

`.env` 파일 생성:

```env
EXPO_PUBLIC_SUPABASE_URL=your-supabase-url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
EXPO_PUBLIC_RESET_PASSWORD_WEB_URL=your-reset-password-url
```

## 배포

```bash
# 웹 빌드
npx expo export:web

# 모바일 빌드 (EAS)
eas build --platform all
```

## 프로젝트 구조

```
src/
├── screens/        # 화면 컴포넌트
├── components/     # 재사용 컴포넌트
├── services/       # API, 스토리지 로직
├── lib/           # Supabase 클라이언트
└── types/         # TypeScript 타입
```
