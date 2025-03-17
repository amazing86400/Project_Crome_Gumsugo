# 📌 검수고 - GA4 이벤트 검수 및 분석 Chrome 확장 프로그램

🚀 **검수고**는 **Google Analytics 4 (GA4) 이벤트 검수 및 분석을 위한 Chrome 확장 프로그램**입니다.
실시간 GA4 이벤트 모니터링, GTM 컨테이너 ID 감지, 필터링 및 정렬 기능을 제공하여 GA4 데이터를 보다 직관적으로 검토할 수 있도록 도와줍니다.

<br>

## 🔹 기능 소개

### 1️⃣ 실시간 GA4 이벤트 추적 및 분석

웹사이트에서 발생하는 GA4 이벤트를 실시간으로 감지하여 표시합니다.
event_name, client_id, session_id 등 GA4 데이터의 핵심 정보를 분석할 수 있습니다.
GA4 ecommerce 이벤트 (purchase, add_to_cart 등) 지원.

### 2️⃣ GTM 컨테이너 ID 자동 감지

웹사이트에서 실행 중인 Google Tag Manager (GTM) 컨테이너 ID를 자동으로 찾아 제공합니다.
GTM ID (GTM-XXXXXX)를 추출하여 GA4 태그 설정을 검토할 수 있습니다.

### 3️⃣ GA4 이벤트 데이터 필터링 및 정렬

특정 event_name, property_id 등을 기준으로 필터링하여 원하는 데이터만 확인할 수 있습니다.
GA4 이벤트 데이터를 정렬 및 하이라이트 표시하여 더욱 직관적으로 분석할 수 있습니다.

### 4️⃣ 페이지 이동 방지 (Lock 기능)

검수 중 페이지가 새로고침되거나 이동하는 것을 방지하여 GA4 이벤트 추적이 중단되지 않도록 보호합니다.

### 5️⃣ GA4 이벤트 데이터 복사 및 공유

"Copy" 버튼을 눌러 GA4 이벤트 데이터를 한 번에 복사할 수 있습니다.
팀원, 클라이언트와 빠르게 공유 가능하여 협업이 더욱 편리해집니다.

<br>

## 📥 설치 방법

Chrome 웹 스토어에서 확장 프로그램을 다운로드하고 설치할 수 있습니다.

🔗 [Chrome 웹 스토어 링크](https://chromewebstore.google.com/detail/jafmfieiiocfnfahcpclpnabmdiimnpm?utm_source=item-share-cb)

<br>

## 🛠 사용 방법

### ✅ Chrome 개발자 도구(DevTools) 열기
- `F12` 또는 `Ctrl + Shift + I` (`Cmd + Option + I` on Mac) 를 눌러 "검수고" 패널을 실행합니다.
<p align="center">
 <img src="https://github.com/user-attachments/assets/85e550f1-14fb-4cf6-98e1-205c42eb23c4" width="70%" />
</p>


### ✅ "Lock" 기능 (페이지 이동 방지)
- 자물쇠 버튼을 클릭하면 현재 페이지에서 이동이 차단됩니다.
- 이를 통해 이벤트 검수 도중 페이지가 이동되는 것을 방지할 수 있습니다.
- 다시 클릭하면 기능이 해제되어 정상적으로 페이지 이동이 가능해집니다.
<p align="center">
 <img src="https://github.com/user-attachments/assets/93552bf9-6641-4d05-9ca2-747b77414a55" width="70%" />
</p>


### ✅ "Filter" 및 "Highlight" 기능
- 깔때기 버튼 (필터)을 클릭하면 팝업 창이 나타납니다.
- GA4 Property 또는 Event Name을 선택하여 원하는 데이터만 필터링할 수 있습니다.
- Highlight 기능을 사용하면 특정 매개변수를 강조하여 쉽게 구분할 수 있습니다.
<p align="center">
 <img src="https://github.com/user-attachments/assets/b18e6472-974f-4298-a749-6d8bf8602f83" width="70%" />
</p>


### ✅ "Sort" 기능 (정렬 설정)
- 정렬 버튼을 클릭하면 팝업 창이 나타납니다.
- 섹션별로 원하는 매개변수의 정렬 순서를 설정하여 데이터를 정리할 수 있습니다.
<p align="center">
 <img src="https://github.com/user-attachments/assets/bd498e08-bff5-4a16-80b2-c0770339647d" width="70%" />
</p>


### ✅ GTM 확인하기
- 우측 상단 GTM 버튼을 클릭하면 현재 페이지에서 사용 중인 GTM 컨테이너 ID(GTM-XXXXXX)를 자동으로 감지하여 표시합니다.
- 이를 통해 GTM 설정을 빠르게 검토할 수 있습니다.
<p align="center">
 <img src="https://github.com/user-attachments/assets/532fa97c-e442-49ac-88b1-2338c6df647d" width="70%" />
</p>


### ✅ "복사하기" 기능
- 복사 버튼을 클릭하면 현재 분석된 GA4 데이터를 복사할 수 있습니다.
- 복사된 데이터는 다른 문서나 메시지로 쉽게 공유할 수 있습니다.

<br>

## ⚙️ 권한 및 보안

- 사용자의 개인정보를 수집하지 않으며, 모든 GA4 데이터는 브라우저 내에서만 분석됩니다.
- 사용자의 데이터를 외부로 전송하지 않으며, Chrome 웹 스토어의 보안 정책을 준수합니다.
- 최소한의 권한만 요청하며, 확장 프로그램이 사용자가 직접 실행한 경우에만 작동합니다.

<br>

## 📌 지원 및 피드백

이 확장 프로그램과 관련하여 문의 사항이나 개선 요청이 있다면 언제든지 연락 주세요!

📩 이메일: rlqja9141@gmail.com

<br>

---

<br>

🚀 지금 검수고를 설치하고, GA4 데이터를 더욱 효율적으로 검수해 보세요!
