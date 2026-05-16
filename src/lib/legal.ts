// Static legal / informational page content for AdSense compliance & E-E-A-T.
// Korean for 'ko', English for every other language (fallback).
// Rendered into the existing `.article-content` styles.

export const SITE_OPERATOR = 'Korea Beauty Guide';
export const CONTACT_EMAIL = 'medicalguide@gmail.com';
export const LAST_UPDATED = '2026-03-01';
export const ESTABLISHED = '2026';

type Doc = { title: string; description: string; html: string };
type LegalKey = 'about' | 'privacy' | 'terms' | 'contact';

function ko(): Record<LegalKey, Doc> {
  return {
    about: {
      title: '사이트 소개',
      description:
        'Korea Beauty Guide는 네이버·카카오·구글의 공개 리뷰와 건강보험심사평가원 공공데이터를 종합해 한국 피부과·에스테틱 클리닉 정보를 다국어로 제공하는 독립 정보 플랫폼입니다.',
      html: `
<h2>우리가 하는 일</h2>
<p>Korea Beauty Guide는 한국의 피부과 및 에스테틱 클리닉을 찾는 국내외 이용자를 위해 만들어진 독립 정보 플랫폼입니다. 한국어를 모르는 외국인 방문객이 광고가 아닌 <strong>실제 이용자 리뷰와 공공데이터</strong>를 기준으로 클리닉을 비교할 수 있도록 돕는 것이 목표입니다.</p>

<h2>데이터를 모으고 검증하는 방법</h2>
<p>모든 글은 다음의 공개된 출처를 교차 검증하여 작성됩니다.</p>
<ul>
<li><strong>네이버 플레이스</strong> — 실제 방문자 리뷰, 평점, 진료시간, 편의시설</li>
<li><strong>카카오맵</strong> — 평점 및 리뷰 수</li>
<li><strong>구글 지도</strong> — 글로벌 이용자 평점 및 리뷰 수</li>
<li><strong>건강보험심사평가원(HIRA)</strong> — 전문의 보유 현황 등 공식 의료기관 정보</li>
</ul>
<p>세 개 플랫폼에서 같은 클리닉을 식별·매칭한 뒤, 신뢰도가 낮은 데이터는 의도적으로 제외합니다. 잘못된 정보를 싣는 것보다 정보를 비워 두는 편이 이용자에게 안전하다고 보기 때문입니다.</p>

<h2>편집 정책</h2>
<p>초안은 수집된 데이터를 바탕으로 작성되며, 발행 전 편집 기준(출처 명시, 수치 근거, 균형 잡힌 서술, 과장·비방 배제)에 따라 검토됩니다. 본 사이트는 소개된 어떤 클리닉으로부터도 비용을 받거나 대가성 게재를 하지 않습니다. 순위와 평가는 오직 공개 데이터에 기반합니다.</p>

<h2>중요한 의료 고지</h2>
<p>본 사이트의 모든 콘텐츠는 <strong>일반 정보 제공 목적</strong>이며 의학적 조언, 진단 또는 치료를 대체하지 않습니다. 시술 결정 전 반드시 자격을 갖춘 의료 전문가와 상담하시고, 클리닉의 가격·운영시간·전문의 정보는 방문 전 해당 클리닉에 직접 확인하시기 바랍니다.</p>

<h2>독립성</h2>
<p>Korea Beauty Guide는 특정 병원·기업과 자본 관계가 없는 독립 매체입니다. 운영비는 페이지에 노출되는 디스플레이 광고(Google AdSense)로 충당되며, 광고는 콘텐츠의 순위나 평가에 영향을 주지 않습니다.</p>

<h2>문의</h2>
<p>정보 정정 요청, 클리닉 데이터 관련 이의, 제휴 문의는 <a href="mailto:${CONTACT_EMAIL}">${CONTACT_EMAIL}</a> 으로 보내주시면 검토 후 회신드립니다.</p>
<p><em>운영: ${SITE_OPERATOR} · 설립 ${ESTABLISHED} · 최종 수정 ${LAST_UPDATED}</em></p>
`.trim(),
    },
    privacy: {
      title: '개인정보처리방침',
      description:
        'Korea Beauty Guide가 수집하는 정보, 쿠키 및 Google AdSense·Analytics 사용, 이용자 권리에 대한 안내입니다.',
      html: `
<p><em>최종 수정: ${LAST_UPDATED}</em></p>
<p>${SITE_OPERATOR}(이하 "사이트")는 이용자의 개인정보를 중요하게 생각하며, 본 방침을 통해 어떤 정보를 어떻게 수집·이용하는지 투명하게 안내합니다.</p>

<h2>1. 수집하는 정보</h2>
<ul>
<li><strong>댓글 작성 시</strong>: 이용자가 입력한 닉네임과 댓글 내용. 이메일·전화번호 등 추가 개인정보는 요구하지 않습니다.</li>
<li><strong>자동 수집 정보</strong>: 접속 기기·브라우저 정보, 방문 페이지, 체류 시간 등 일반적인 이용 통계(Google Analytics를 통해 익명 집계).</li>
</ul>

<h2>2. 쿠키 및 광고</h2>
<p>본 사이트는 Google AdSense를 통해 광고를 게재합니다. Google을 포함한 제3자 광고 사업자는 쿠키를 사용하여 이용자의 이전 방문 기록을 기반으로 맞춤 광고를 제공할 수 있습니다.</p>
<ul>
<li>Google은 광고 쿠키(DoubleClick 쿠키)를 사용하여 이용자가 본 사이트 및 다른 사이트를 방문한 기록에 기반한 광고를 게재합니다.</li>
<li>이용자는 <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer">Google 광고 설정</a>에서 맞춤 광고를 비활성화할 수 있습니다.</li>
<li>제3자 광고 쿠키 전반은 <a href="https://www.aboutads.info/choices/" target="_blank" rel="noopener noreferrer">www.aboutads.info</a> 에서 일괄 거부할 수 있습니다.</li>
</ul>

<h2>3. 분석 도구</h2>
<p>이용 통계 분석을 위해 Google Analytics를 사용합니다. 수집되는 데이터는 익명화된 집계 형태이며 개별 이용자를 식별하지 않습니다.</p>

<h2>4. 정보의 이용 목적</h2>
<p>수집된 정보는 (1) 콘텐츠 품질 개선, (2) 댓글 기능 제공, (3) 트래픽 분석 목적으로만 사용되며, 제3자에게 판매하거나 마케팅 목적으로 임의 제공하지 않습니다.</p>

<h2>5. 데이터 보관 및 삭제</h2>
<p>댓글은 작성자가 삭제를 요청하면 합리적 기간 내에 삭제됩니다. 분석 데이터는 Google Analytics 정책에 따라 보관됩니다.</p>

<h2>6. 이용자의 권리</h2>
<p>이용자는 자신과 관련된 정보의 열람·정정·삭제를 요청할 수 있습니다. 요청은 <a href="mailto:${CONTACT_EMAIL}">${CONTACT_EMAIL}</a> 으로 접수해 주시기 바랍니다.</p>

<h2>7. 아동의 개인정보</h2>
<p>본 사이트는 만 14세 미만 아동을 대상으로 하지 않으며 해당 연령대의 개인정보를 의도적으로 수집하지 않습니다.</p>

<h2>8. 방침의 변경</h2>
<p>본 방침은 법령 또는 서비스 변경에 따라 개정될 수 있으며, 변경 시 본 페이지에 수정일과 함께 게시합니다.</p>

<h2>9. 문의</h2>
<p>개인정보 관련 문의: <a href="mailto:${CONTACT_EMAIL}">${CONTACT_EMAIL}</a></p>
`.trim(),
    },
    terms: {
      title: '이용약관',
      description:
        'Korea Beauty Guide 콘텐츠의 이용 조건, 정보의 한계, 면책 사항에 대한 안내입니다.',
      html: `
<p><em>최종 수정: ${LAST_UPDATED}</em></p>

<h2>1. 목적</h2>
<p>본 약관은 ${SITE_OPERATOR}(이하 "사이트")가 제공하는 정보 서비스의 이용 조건을 규정합니다. 사이트를 이용함으로써 이용자는 본 약관에 동의한 것으로 간주됩니다.</p>

<h2>2. 정보의 성격과 한계</h2>
<p>본 사이트가 제공하는 모든 콘텐츠는 공개된 리뷰·평점·공공데이터를 종합한 <strong>일반 정보</strong>이며, 의학적 조언이 아닙니다. 어떤 시술이나 클리닉에 대한 보증·추천·권유로 해석되어서는 안 됩니다. 시술 관련 결정은 반드시 자격을 갖춘 의료 전문가와의 상담을 통해 이루어져야 합니다.</p>

<h2>3. 데이터 정확성</h2>
<p>클리닉 정보(주소, 전화, 진료시간, 평점, 전문의 현황 등)는 수집 시점의 외부 출처를 기반으로 하며 시간이 지나면 달라질 수 있습니다. 사이트는 정보의 완전성·정확성·최신성을 보증하지 않으며, 이용자는 방문 전 해당 클리닉에 직접 확인할 책임이 있습니다.</p>

<h2>4. 책임의 제한</h2>
<p>사이트 또는 운영자는 본 사이트의 정보 이용 또는 이용 불능으로 인해 발생한 직접·간접·부수적 손해에 대해 법이 허용하는 최대 범위 내에서 책임을 지지 않습니다.</p>

<h2>5. 제3자 링크</h2>
<p>본 사이트는 네이버, 카카오, 구글 등 외부 사이트로 연결되는 링크를 포함합니다. 외부 사이트의 콘텐츠나 개인정보 처리에 대해 본 사이트는 책임지지 않습니다.</p>

<h2>6. 지식재산권</h2>
<p>사이트의 편집·구성·디자인 및 자체 작성 텍스트의 권리는 운영자에게 있습니다. 인용된 리뷰·평점 등은 각 원출처에 권리가 있으며 정보 제공 목적의 공정 이용 범위에서 사용됩니다.</p>

<h2>7. 금지 행위</h2>
<p>이용자는 자동화된 수단을 이용한 무단 대량 수집, 서비스 운영 방해, 타인 비방·허위 댓글 게시 등의 행위를 해서는 안 됩니다.</p>

<h2>8. 약관의 변경</h2>
<p>본 약관은 필요 시 개정될 수 있으며 변경 사항은 본 페이지에 게시됩니다. 게시 후 계속 이용하는 경우 변경에 동의한 것으로 봅니다.</p>

<h2>9. 문의</h2>
<p>약관 관련 문의: <a href="mailto:${CONTACT_EMAIL}">${CONTACT_EMAIL}</a></p>
`.trim(),
    },
    contact: {
      title: '문의하기',
      description:
        'Korea Beauty Guide 정보 정정 요청, 데이터 관련 이의, 제휴 및 일반 문의 연락처입니다.',
      html: `
<p>Korea Beauty Guide에 대한 의견, 정보 정정 요청, 데이터 관련 이의 또는 제휴 문의를 환영합니다.</p>

<h2>이메일</h2>
<p><a href="mailto:${CONTACT_EMAIL}">${CONTACT_EMAIL}</a></p>

<h2>이런 문의를 도와드립니다</h2>
<ul>
<li><strong>정보 정정</strong> — 클리닉 정보(주소·전화·진료시간 등)에 오류가 있는 경우, 페이지 주소와 함께 알려주시면 확인 후 신속히 수정합니다.</li>
<li><strong>데이터 관련 이의</strong> — 특정 리뷰·평가의 게재에 대한 이의가 있는 클리닉 관계자분은 클리닉명과 함께 사유를 보내주시기 바랍니다.</li>
<li><strong>삭제 요청</strong> — 작성하신 댓글의 삭제를 원하시면 해당 페이지와 닉네임을 알려주세요.</li>
<li><strong>제휴 및 기타</strong> — 데이터 협력, 미디어 문의 등.</li>
</ul>

<h2>응답 시간</h2>
<p>모든 문의는 검토 후 통상 영업일 기준 3~5일 이내에 회신드리도록 노력합니다.</p>

<p><em>운영: ${SITE_OPERATOR} · 최종 수정 ${LAST_UPDATED}</em></p>
`.trim(),
    },
  };
}

function en(): Record<LegalKey, Doc> {
  return {
    about: {
      title: 'About Us',
      description:
        'Korea Beauty Guide is an independent platform that compares Korean dermatology and aesthetic clinics using public reviews from Naver, Kakao and Google plus official HIRA health data.',
      html: `
<h2>What We Do</h2>
<p>Korea Beauty Guide is an independent information platform built for international and local visitors looking for dermatology and aesthetic clinics in Korea. Our goal is to help people who do not read Korean compare clinics based on <strong>real user reviews and public data</strong> rather than advertising.</p>

<h2>How We Collect and Verify Data</h2>
<p>Every article is produced by cross-checking the following public sources:</p>
<ul>
<li><strong>Naver Place</strong> — real visitor reviews, ratings, business hours, facilities</li>
<li><strong>KakaoMap</strong> — ratings and review counts</li>
<li><strong>Google Maps</strong> — global user ratings and review counts</li>
<li><strong>HIRA (Health Insurance Review &amp; Assessment Service)</strong> — official information such as licensed specialists on staff</li>
</ul>
<p>We identify and match the same clinic across all three platforms, and deliberately exclude low-confidence data. Leaving a field blank is safer for the reader than publishing something inaccurate.</p>

<h2>Editorial Policy</h2>
<p>Drafts are created from the collected data and reviewed against editorial standards (cited sources, numeric evidence, balanced wording, no exaggeration or defamation) before publication. We do <strong>not</strong> accept payment from any clinic featured on this site, and no listing is sponsored. Rankings and assessments are based solely on public data.</p>

<h2>Important Medical Disclaimer</h2>
<p>All content on this site is for <strong>general informational purposes only</strong> and is not a substitute for professional medical advice, diagnosis, or treatment. Always consult a qualified healthcare professional before making any treatment decision, and verify a clinic's pricing, hours, and specialist information directly with the clinic before visiting.</p>

<h2>Independence</h2>
<p>Korea Beauty Guide has no ownership ties to any hospital or company. Operating costs are covered by display advertising (Google AdSense). Advertising has no influence on content rankings or assessments.</p>

<h2>Contact</h2>
<p>For corrections, clinic data disputes, or partnership inquiries, email <a href="mailto:${CONTACT_EMAIL}">${CONTACT_EMAIL}</a> and we will respond after review.</p>
<p><em>Operated by ${SITE_OPERATOR} · Established ${ESTABLISHED} · Last updated ${LAST_UPDATED}</em></p>
`.trim(),
    },
    privacy: {
      title: 'Privacy Policy',
      description:
        'How Korea Beauty Guide collects information, uses cookies and Google AdSense / Analytics, and how to exercise your rights.',
      html: `
<p><em>Last updated: ${LAST_UPDATED}</em></p>
<p>${SITE_OPERATOR} ("the Site") respects your privacy. This policy explains what information we collect and how it is used.</p>

<h2>1. Information We Collect</h2>
<ul>
<li><strong>When you post a comment</strong>: the nickname and comment text you enter. We do not require email, phone number, or other personal identifiers.</li>
<li><strong>Automatically collected</strong>: device/browser type, pages visited, and time on page, aggregated anonymously via Google Analytics.</li>
</ul>

<h2>2. Cookies and Advertising</h2>
<p>This Site displays ads through Google AdSense. Third-party vendors, including Google, may use cookies to serve ads based on a user's prior visits to this and other websites.</p>
<ul>
<li>Google uses advertising cookies (the DoubleClick cookie) to serve ads based on your visits to this and other sites.</li>
<li>You may opt out of personalized advertising via <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer">Google Ads Settings</a>.</li>
<li>You may opt out of third-party vendor cookies at <a href="https://www.aboutads.info/choices/" target="_blank" rel="noopener noreferrer">www.aboutads.info</a>.</li>
</ul>

<h2>3. Analytics</h2>
<p>We use Google Analytics to understand usage. The data is aggregated and anonymized and does not identify individual users.</p>

<h2>4. How We Use Information</h2>
<p>Collected information is used only to (1) improve content quality, (2) provide the comment feature, and (3) analyze traffic. We do not sell it to third parties or share it for unrelated marketing.</p>

<h2>5. Data Retention and Deletion</h2>
<p>Comments are deleted within a reasonable period upon the author's request. Analytics data is retained per Google Analytics policy.</p>

<h2>6. Your Rights</h2>
<p>You may request access to, correction of, or deletion of information related to you by emailing <a href="mailto:${CONTACT_EMAIL}">${CONTACT_EMAIL}</a>.</p>

<h2>7. Children's Privacy</h2>
<p>This Site is not directed to children under 14 and does not knowingly collect their personal information.</p>

<h2>8. Changes to This Policy</h2>
<p>This policy may be updated to reflect legal or service changes. Updates will be posted on this page with a revised date.</p>

<h2>9. Contact</h2>
<p>Privacy inquiries: <a href="mailto:${CONTACT_EMAIL}">${CONTACT_EMAIL}</a></p>
`.trim(),
    },
    terms: {
      title: 'Terms of Service',
      description:
        'Conditions for using Korea Beauty Guide content, the limits of the information provided, and disclaimers.',
      html: `
<p><em>Last updated: ${LAST_UPDATED}</em></p>

<h2>1. Purpose</h2>
<p>These terms govern use of the information service provided by ${SITE_OPERATOR} ("the Site"). By using the Site you agree to these terms.</p>

<h2>2. Nature and Limits of the Information</h2>
<p>All content is <strong>general information</strong> compiled from public reviews, ratings, and public data, and is not medical advice. It must not be interpreted as a guarantee, endorsement, or recommendation of any treatment or clinic. Treatment decisions must be made in consultation with a qualified medical professional.</p>

<h2>3. Data Accuracy</h2>
<p>Clinic information (address, phone, hours, ratings, specialists, etc.) is based on external sources at the time of collection and may change over time. The Site does not warrant the completeness, accuracy, or timeliness of the information; users are responsible for verifying directly with the clinic before visiting.</p>

<h2>4. Limitation of Liability</h2>
<p>To the maximum extent permitted by law, the Site and its operator are not liable for any direct, indirect, or incidental damages arising from use of, or inability to use, the information on this Site.</p>

<h2>5. Third-Party Links</h2>
<p>The Site contains links to external sites such as Naver, Kakao, and Google. We are not responsible for the content or privacy practices of those sites.</p>

<h2>6. Intellectual Property</h2>
<p>Rights to the Site's editorial selection, structure, design, and originally written text belong to the operator. Quoted reviews and ratings remain the property of their original sources and are used within fair-use limits for informational purposes.</p>

<h2>7. Prohibited Conduct</h2>
<p>Users must not perform unauthorized bulk scraping by automated means, disrupt the service, or post defamatory or false comments.</p>

<h2>8. Changes to These Terms</h2>
<p>These terms may be revised as needed; changes will be posted on this page. Continued use after posting constitutes acceptance.</p>

<h2>9. Contact</h2>
<p>Inquiries about these terms: <a href="mailto:${CONTACT_EMAIL}">${CONTACT_EMAIL}</a></p>
`.trim(),
    },
    contact: {
      title: 'Contact',
      description:
        'Contact Korea Beauty Guide for corrections, clinic data disputes, comment removal, or partnership inquiries.',
      html: `
<p>We welcome feedback, correction requests, data disputes, and partnership inquiries about Korea Beauty Guide.</p>

<h2>Email</h2>
<p><a href="mailto:${CONTACT_EMAIL}">${CONTACT_EMAIL}</a></p>

<h2>What We Can Help With</h2>
<ul>
<li><strong>Corrections</strong> — If clinic information (address, phone, hours, etc.) is wrong, send the page URL and we will fix it promptly.</li>
<li><strong>Data disputes</strong> — Clinic representatives objecting to a published review or assessment may write to us with the clinic name and reason.</li>
<li><strong>Removal requests</strong> — To remove a comment you posted, tell us the page and nickname.</li>
<li><strong>Partnerships and other</strong> — Data collaboration, media inquiries, etc.</li>
</ul>

<h2>Response Time</h2>
<p>We aim to respond to all inquiries within 3–5 business days after review.</p>

<p><em>Operated by ${SITE_OPERATOR} · Last updated ${LAST_UPDATED}</em></p>
`.trim(),
    },
  };
}

export function getLegalDoc(lang: string, key: LegalKey): Doc {
  const set = lang === 'ko' ? ko() : en();
  return set[key];
}
