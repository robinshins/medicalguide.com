export interface PricingItem {
  name: string;
  insurance: string;
  priceRange: string;
  average: string;
  note?: string;
}

export interface PricingSection {
  title: string;
  description?: string;
  items: PricingItem[];
  footnote?: string;
}

export const DENTAL_PRICING_KO: {
  title: string;
  subtitle: string;
  intro: string;
  lastUpdated: string;
  sections: PricingSection[];
  factors: string[];
  sources: string[];
} = {
  title: '한국 치과 시술 평균 가격 가이드 (2025~2026)',
  subtitle: '보건복지부·건강보험심사평가원 공식 비급여 진료비 공개 자료 기반',
  intro: '이 가이드는 보건복지부·건강보험심사평가원(심평원) 공식 비급여 진료비 공개 자료(2025년 9월 발표)와 국내 주요 치과 정보 플랫폼(모두닥, 뱅크샐러드 등)의 조사 데이터를 종합하여 한국 치과 시술 항목별 평균 가격을 정리한 것입니다.',
  lastUpdated: '2025-09',
  sections: [],
  factors: [],
  sources: [],
};

export const DERMA_PRICING_KO: typeof DENTAL_PRICING_KO = {
  title: '한국 뷰티 클리닉 시술 가격 완벽 가이드 (2026)',
  subtitle: '실거래 데이터 기반 시술별 비용 비교 — 보톡스부터 리프팅까지',
  intro: '한국에서 피부과·에스테틱 시술을 고려하고 계신가요? 이 가이드는 2026년 3월 기준 국내 뷰티 클리닉의 실제 거래 가격과 건강보험심사평가원 공개 자료를 종합 분석한 것입니다. 시술 가격은 클리닉 위치, 의료진 경력, 장비 종류, 사용 제품 브랜드에 따라 크게 다를 수 있으므로 아래 금액은 참고용으로 활용하시고, 상담 시 정확한 견적을 확인하세요.',
  lastUpdated: '2026-03',
  sections: [
    {
      title: '보톡스 주사',
      description: '주름 완화, 턱선 슬리밍, 어깨 라인 교정 등 가장 대중적인 안티에이징 시술. 시술 시간 10~20분, 일상 복귀 즉시 가능.',
      items: [
        { name: '이마 주름 보톡스', insurance: '비급여', priceRange: '3~8만 원', average: '5만 원', note: '10~20유닛' },
        { name: '미간(찡그림) 보톡스', insurance: '비급여', priceRange: '3~7만 원', average: '5만 원' },
        { name: '눈가 잔주름 보톡스', insurance: '비급여', priceRange: '3~8만 원', average: '5만 원', note: '까마귀발 교정' },
        { name: '사각턱 슬리밍 (양쪽)', insurance: '비급여', priceRange: '5~15만 원', average: '10만 원', note: '교근 축소' },
        { name: '입꼬리 리프트 보톡스', insurance: '비급여', priceRange: '3~7만 원', average: '5만 원' },
        { name: '어깨(승모근) 보톡스', insurance: '비급여', priceRange: '10~30만 원', average: '20만 원', note: '어깨 라인 개선' },
        { name: '겨드랑이 다한증 보톡스', insurance: '비급여', priceRange: '20~50만 원', average: '35만 원' },
        { name: '풀페이스 보톡스', insurance: '비급여', priceRange: '15~40만 원', average: '25만 원', note: '이마+미간+눈가+턱' },
      ],
      footnote: '나보타, 보툴렉스, 디스포트, 제오민 등 브랜드별 단가가 상이합니다. 효과 유지 기간은 평균 3~6개월이며, 반복 시술 시 효과가 오래 지속되는 경향이 있습니다.',
    },
    {
      title: '필러 시술',
      description: '히알루론산(HA) 기반 충전제를 피부 아래 주입하여 볼륨감을 부여하거나 주름·윤곽을 개선하는 비수술 시술.',
      items: [
        { name: '팔자주름(비순골) 필러 1cc', insurance: '비급여', priceRange: '15~40만 원', average: '25만 원' },
        { name: '입술 볼륨 필러 1cc', insurance: '비급여', priceRange: '15~35만 원', average: '25만 원' },
        { name: '턱 라인 필러 1~2cc', insurance: '비급여', priceRange: '20~50만 원', average: '35만 원' },
        { name: '코끝 필러 1cc', insurance: '비급여', priceRange: '15~40만 원', average: '30만 원', note: '비수술 코 성형' },
        { name: '이마 볼륨 필러 2~4cc', insurance: '비급여', priceRange: '40~100만 원', average: '60만 원' },
        { name: '볼(광대 아래) 필러 2~4cc', insurance: '비급여', priceRange: '40~80만 원', average: '55만 원' },
        { name: '다크서클(눈밑) 필러', insurance: '비급여', priceRange: '20~50만 원', average: '35만 원' },
      ],
      footnote: '레스틸렌, 쥬비덤, 벨로테로 등 제품 브랜드와 투입량에 따라 비용이 달라집니다. 시술 효과는 6~18개월 유지되며, 녹여내기(히알루로니다제)가 가능합니다.',
    },
    {
      title: '레이저 치료',
      description: '색소 침착, 잡티, 모공, 피부결 개선 등 다양한 피부 고민에 대응하는 레이저 기반 시술.',
      items: [
        { name: '피코 토닝 (색소·잡티 제거)', insurance: '비급여', priceRange: '5~15만 원/회', average: '10만 원/회', note: '기미·주근깨 개선' },
        { name: '프락셔널 레이저 (흉터·모공)', insurance: '비급여', priceRange: '15~40만 원/회', average: '25만 원/회' },
        { name: 'CO2 점·사마귀 제거', insurance: '비급여', priceRange: '1~5만 원/개', average: '2만 원/개' },
        { name: 'IPL 광선치료 (홍조·색소)', insurance: '비급여', priceRange: '5~15만 원/회', average: '10만 원/회' },
        { name: '엑셀V 혈관·홍조 레이저', insurance: '비급여', priceRange: '10~30만 원/회', average: '20만 원/회' },
        { name: '제네시스 피부결·톤 개선', insurance: '비급여', priceRange: '5~15만 원/회', average: '10만 원/회' },
        { name: '레이저 토닝 미백', insurance: '비급여', priceRange: '3~10만 원/회', average: '7만 원/회' },
      ],
      footnote: '대부분 5~10회 코스로 진행하며, 패키지 구매 시 1회당 비용이 20~30% 절감됩니다.',
    },
    {
      title: '리프팅 시술 (울쎄라·써마지·실)',
      description: '수술 없이 피부 탄력과 윤곽을 개선하는 비침습·최소침습 리프팅 프로그램.',
      items: [
        { name: '울쎄라 풀페이스', insurance: '비급여', priceRange: '150~400만 원', average: '250만 원', note: '초음파 HIFU' },
        { name: '울쎄라 부분 (턱선 or 이마)', insurance: '비급여', priceRange: '50~150만 원', average: '100만 원' },
        { name: '써마지 FLX 풀페이스 900샷', insurance: '비급여', priceRange: '80~200만 원', average: '130만 원', note: '고주파 RF' },
        { name: '써마지 FLX 아이 450샷', insurance: '비급여', priceRange: '50~100만 원', average: '70만 원' },
        { name: '인모드 리프팅', insurance: '비급여', priceRange: '30~80만 원', average: '50만 원' },
        { name: '슈링크 유니버스', insurance: '비급여', priceRange: '15~50만 원', average: '30만 원', note: 'HIFU 입문용' },
        { name: 'PDO 실 리프팅', insurance: '비급여', priceRange: '30~150만 원', average: '80만 원', note: '실 종류·개수에 따라 변동' },
      ],
      footnote: '정품 팁·카트리지 사용 여부를 반드시 확인하세요. 시술 효과는 6~12개월 유지되며, 연 1~2회 반복 권장.',
    },
    {
      title: '여드름·흉터·모공 집중 케어',
      description: '활성 여드름 진정부터 오래된 흉터·넓은 모공까지 단계별 치료 프로그램.',
      items: [
        { name: '여드름 압출+진정 관리', insurance: '비급여', priceRange: '3~10만 원/회', average: '5만 원/회' },
        { name: '여드름 PDT 광역학치료', insurance: '비급여', priceRange: '10~25만 원/회', average: '15만 원/회' },
        { name: '경구 여드름약 (이소트레티노인 등)', insurance: '혼합', priceRange: '3~8만 원/월', average: '5만 원/월', note: '보험 적용 시 절감' },
        { name: '여드름 흉터 프락셔널', insurance: '비급여', priceRange: '15~40만 원/회', average: '25만 원/회' },
        { name: '서브시전 흉터 박리', insurance: '비급여', priceRange: '10~30만 원/회', average: '20만 원/회' },
        { name: '모공 타이트닝 레이저', insurance: '비급여', priceRange: '5~20만 원/회', average: '12만 원/회' },
        { name: 'MTS 미세침 재생 치료', insurance: '비급여', priceRange: '5~15만 원/회', average: '10만 원/회' },
      ],
    },
    {
      title: '스킨부스터·재생 주사',
      description: '피부 속부터 수분·탄력·광채를 끌어올리는 인젝션 프로그램. 시술 직후 자연스러운 글로우 효과.',
      items: [
        { name: '물광주사 (HA 수분 공급)', insurance: '비급여', priceRange: '7~33만 원', average: '15만 원' },
        { name: '리쥬란힐러 2cc (PDRN 재생)', insurance: '비급여', priceRange: '22~30만 원', average: '26만 원', note: '연어 DNA 유래' },
        { name: '쥬베룩 2cc (PLA+HA 복합)', insurance: '비급여', priceRange: '19~45만 원', average: '30만 원' },
        { name: '쥬베룩볼륨 (탄력+리프팅)', insurance: '비급여', priceRange: '24~50만 원', average: '35만 원' },
        { name: '연어주사 PDRN', insurance: '비급여', priceRange: '12~15만 원', average: '13만 원' },
        { name: '엑소좀 3~6cc (줄기세포 성장인자)', insurance: '비급여', priceRange: '22~36만 원', average: '29만 원' },
        { name: '스컬트라 5cc (콜라겐 부스팅)', insurance: '비급여', priceRange: '55~89만 원', average: '70만 원', note: '점진적 볼륨 회복' },
        { name: '글루타치온 미백 주사', insurance: '비급여', priceRange: '3~8만 원', average: '5만 원' },
        { name: '고농도 비타민C 주사', insurance: '비급여', priceRange: '2.9~7만 원', average: '5만 원' },
      ],
      footnote: '2026년 3월 실거래 데이터 기준. 3~5회 반복 시 효과 극대화.',
    },
    {
      title: '윤곽·바디 슬리밍',
      description: '얼굴 윤곽 정리부터 체형 관리까지, 비수술로 라인을 다듬는 시술.',
      items: [
        { name: '페이스 윤곽주사', insurance: '비급여', priceRange: '5~20만 원/회', average: '10만 원/회' },
        { name: '지방분해주사 (턱·볼)', insurance: '비급여', priceRange: '5~15만 원/회', average: '10만 원/회' },
        { name: '지방분해주사 (복부·팔뚝)', insurance: '비급여', priceRange: '10~30만 원/회', average: '20만 원/회' },
        { name: '쿨스컬프팅 냉각지방분해', insurance: '비급여', priceRange: '20~50만 원/부위', average: '35만 원/부위' },
      ],
    },
    {
      title: '기초 스킨케어 프로그램',
      description: '클리닉에서 받는 전문 피부관리. 각질 정리, 피지 제거, 수분 공급까지.',
      items: [
        { name: '아쿠아필 딥클렌징', insurance: '비급여', priceRange: '2.9~5만 원', average: '4만 원' },
        { name: '기본 피부관리 프로그램', insurance: '비급여', priceRange: '3~15만 원', average: '8.5만 원' },
        { name: 'LDM 초음파 수분관리', insurance: '비급여', priceRange: '5.9~15만 원', average: '10만 원' },
        { name: '블랙필/라라필 각질케어', insurance: '비급여', priceRange: '4.5~8만 원', average: '6만 원' },
      ],
    },
    {
      title: '의료 레이저 제모',
      description: '의료용 레이저를 이용한 영구 감모 시술. 부위별·횟수별 가격 비교.',
      items: [
        { name: '겨드랑이 제모 1회', insurance: '비급여', priceRange: '3~8만 원', average: '5만 원' },
        { name: '팔 전체 제모 1회', insurance: '비급여', priceRange: '8~20만 원', average: '12만 원' },
        { name: '다리 전체 제모 1회', insurance: '비급여', priceRange: '15~35만 원', average: '25만 원' },
        { name: '비키니 라인 제모 1회', insurance: '비급여', priceRange: '5~15만 원', average: '10만 원' },
        { name: '남성 수염 제모 1회', insurance: '비급여', priceRange: '5~15만 원', average: '10만 원' },
        { name: '전신 제모 1회', insurance: '비급여', priceRange: '30~80만 원', average: '50만 원' },
      ],
      footnote: '5~8회 패키지 결제 시 1회당 30~50% 할인이 일반적. 의료기관 레이저(다이오드, 알렉산드라이트) 사용 여부 확인 필수.',
    },
  ],
  factors: [
    '클리닉 입지: 서울 강남·청담 권역은 비강남·지방 대비 30~50% 높은 가격대 형성',
    '장비 등급: 최신 정품 장비(울쎄라 4세대, 써마지 FLX 등) 사용 여부에 따라 동일 시술도 2배 이상 차이',
    '시술 범위: 풀페이스 vs 부분 시술로 가격이 2~3배 달라지며, 복합 시술 시 패키지 할인 적용',
    '횟수 할인: 단회 결제 대비 5~10회 코스 구매 시 30~50% 절감 가능',
    '제품 브랜드: 보톡스·필러·스킨부스터 모두 사용 제품에 따라 단가가 크게 상이',
  ],
  sources: [
    '건강보험심사평가원 비급여 진료비 정보 공개 (2025.09 발표)',
    '보건복지부 비급여 진료비용 공개 기준 고시',
    '실거래가 기반 의료비 비교 플랫폼 데이터 (2026.03 수집)',
    '국내 주요 피부과·에스테틱 클리닉 공시 가격표 참조',
  ],
};
