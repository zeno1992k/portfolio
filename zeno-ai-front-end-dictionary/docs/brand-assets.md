# 브랜드와 설치 자산

앱 이름은 `zeno-ai-front-dictionary`, 설치 시 짧은 이름은 `zeno`입니다. 라이트·다크 모드에 맞춰 심볼, 아이콘과 테마 색상을 사용합니다.

| 경로 | 용도 |
| --- | --- |
| `public/brand/zeno-blue/logo.svg` | 라이트 모드 원본 심볼 |
| `public/brand/zeno-blue/logo-dark.svg` | 다크 모드 원본 심볼 |
| `public/brand/zeno-blue/favicon*` | 브라우저 아이콘 |
| `public/brand/zeno-blue/apple-icon*` | Apple 홈 화면 아이콘 |
| `public/brand/zeno-blue/og-image*` | 공유 이미지 |
| `public/icons/` | 설치 manifest의 일반·maskable 아이콘 |
| `public/fonts/` | 자체 호스팅 글꼴과 라이선스 |

원본 SVG는 145 × 145 viewBox를 사용합니다. 강조색은 라이트 `#0066FF`, 다크 `#5E9FFF`이며 Montage 테마와 연결합니다. 한글에는 Pretendard, 영문 브랜드에는 Montserrat를 사용합니다.

## 아이콘 재생성

Windows PowerShell과 System.Drawing을 사용합니다. 원본 파일을 명시하여 실행합니다.

```powershell
./scripts/export-zeno-blue-icons.ps1 -SourceSvg ./public/brand/zeno-blue/logo.svg -SourceDarkSvg ./public/brand/zeno-blue/logo-dark.svg
```

SVG 경로를 읽고 크기별 PNG와 ICO를 생성합니다. 원본 경로와 fill은 보존합니다. 다른 브랜드용 내보내기 스크립트도 원본 파일·폴더를 인자로 받습니다.

## 테마와 캐시

화면 테마는 `system`, `light`, `dark`를 지원하고 기기별 설정으로 저장합니다. 초기 head 스크립트와 UI 테마를 연결해 파비콘·Apple 아이콘·브라우저 색상을 반영합니다. 서비스 워커가 브랜드 자산과 글꼴을 캐시하며, 정적 manifest에는 설치용 아이콘을 지정합니다.

실제 iPhone 설치 아이콘·Safari 상태 표시줄과 외부 공유 미리보기는 별도 확인 대상입니다. 배포 시 글꼴과 UI 라이브러리의 라이선스 파일을 함께 제공합니다.
