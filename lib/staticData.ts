import { BedType } from "../types/room";

//* 1월부터 12월까지
export const monthList = [
  "1월",
  "2월",
  "3월",
  "4월",
  "5월",
  "6월",
  "7월",
  "8월",
  "9월",
  "10월",
  "11월",
  "12월",
];

export const genderList = ["여성", "남성"];

//* 1부터 31까지
export const dayList = Array.from(Array(31), (_, i) => `${String(i + 1)}일`);

//* 2004년부터 1900년까지
export const yearList = Array.from(
  Array(104),
  (_, i) => `${String(2004 - i)}년`
);

//* 숙소 큰 범위의 건물유형
export const largeBuildingTypeList = [
  "아파트",
  "주택",
  "별채",
  "독특한 숙소",
  "B&B",
  "부티크호텔",
];

//* 아파트 건물유형
export const apartmentBuildingTypeList = [
  "아파트",
  "공동주택",
  "별채",
  "카사 파르티쿨라르(쿠바)",
  "로프트",
  "레지던스",
];

//*주택 건물유형
export const houstBuildingTypeList = [
  "주택",
  "방갈로",
  "통나무집",
  "카사",
  "파르티쿨라르(쿠바)",
  "살레",
  "전원주택",
  "키클라데스",
  "주택(그리스)",
  "담무소(이탈리아)",
  "돔하우스",
  "땅속의집",
  "농장 체험 숙박",
  "하우스 보트",
  "오두막",
  "등대",
  "팬션(한국)",
  "마차(영국, 프랑스)",
  "초소형주택",
  "타운하우스",
  "트룰로(이탈리아)",
  "저택",
];

//* 별채 건물 유형
export const secondaryUnitBuildingTypeList = [
  "게스트용 별채",
  "게스트 스위트",
  "농장 체험 숙박",
];

//* 독특한숙소 건물 유형
export const uniqueSpaceBuildingTypeList = [
  "헛간",
  "보트",
  "버스",
  "캠핑카",
  "캠핑장",
  "성",
  "동굴",
  "돔하우스",
  "땅속의 집",
  "농장 체험 숙박",
  "하우스 보트",
  "오두막",
  "이글루",
  "섬",
  "등대",
  "펜션(한국)",
  "비행기",
  "마차(영국, 프랑스)",
  "텐트",
  "초소형 주택",
  "티피",
  "기차",
  "트리하우스",
  "풍차",
  "유르트",
];

//* B&B 건물유형
export const bnbBuildingTypeList = [
  "B&B",
  "카사 파르티쿨라르(쿠바)",
  "농장 체험 숙박",
  "민수 (타이완)",
  "산장",
  "료칸(일본)",
];

//* 부티크 호텔 건물유형
export const boutiquesHotelBuildingTypeList = [
  "부티크 호텔",
  "아파트 호텔",
  "헤리티지 호텔(인도)",
  "호스텔",
  "호텔",
  "산장",
  "리조트",
  "레지던스",
  "객잔(중국)",
];

//* 침실 개수
export const bedroomCountList = Array.from(Array(16), (_, i) => `침실 ${i}개`);

//* 침대 유형
export const bedTypes: BedType[] = [
  "소파",
  "에어 매트릭스",
  "요와 이불",
  "싱글",
  "더블",
  "퀸",
  "이층 침대",
  "바닥용 에어매트릭스",
  "유아 침대",
  "유아용 침대",
  "해먹",
  "물침대",
];

//* 국가 리스트
export const countryList = [
  "가나",
  "가봉",
  "가이아나",
  "감비아",
  "건지",
  "과들루프",
  "과테말라",
  "괌",
  "그레나다",
  "그루지야",
  "그리스",
  "그린란드",
  "기네비쏘",
  "기니",
  "까뽀베르데",
  "나미비아",
  "나우루",
  "나이지리아",
  "남수단",
  "남아프리카",
  "네덜란드",
  "네덜란드령 카리브",
  "네팔",
  "노르웨이",
  "노퍽섬",
  "뉴 칼레도니아",
  "뉴질랜드",
  "니우에",
  "니제르",
  "니카라과",
  "대만",
  "덴마크",
  "도미니카",
  "도미니카 공화국",
  "독일",
  "동티모르",
  "라오스",
  "라이베리아",
  "라트비아",
  "러시아",
  "레바논",
  "레소토",
  "루마니아",
  "룩셈부르크",
  "르완다",
  "리비아",
  "리유니온",
  "리투아니아",
  "리히텐슈타인",
  "마다가스카르",
  "마샬 군도",
  "마요티",
  "마카오",
  "말라위",
  "말레이시아",
  "말리",
  "말티니크",
  "맨 섬",
  "멕시코",
  "모나코",
  "모로코",
  "모리셔스",
  "모리타니",
  "모잠비크",
  "몬테네그로",
  "몬트세라트",
  "몰도바",
  "몰디브",
  "몰타",
  "몽골",
  "미국",
  "미국령 버진 아일랜드",
  "미얀마",
  "미크로네시아",
  "바누아투",
  "바레인",
  "바베이도스",
  "바티칸",
  "바하마",
  "방글라데시",
  "버뮤다",
  "베냉",
  "베네수엘라",
  "베트남",
  "벨기에",
  "벨라루스",
  "벨리즈",
  "보스니아 헤르체고비나",
  "보츠와나",
  "볼리비아",
  "부룬디",
  "부르키나파소",
  "부탄",
  "북마리아나제도",
  "북마케도니아",
  "불가리아",
  "브라질",
  "브루나이",
  "사모아",
  "사우디아라비아",
  "사우스조지아 사우스샌드위치 제도",
  "사이프러스",
  "산마리노",
  "상투메 프린시페",
  "생 마르탱",
  "생 바르텔르미",
  "서사하라",
  "세네갈",
  "세르비아",
  "세인트루시아",
  "세인트빈센트그레나딘",
  "세인트크리스토퍼 네비스",
  "세인트피에르-미케롱",
  "세인트헬레나",
  "소말리아",
  "솔로몬 제도",
  "수단",
  "수리남",
  "쉐이쉘",
  "스리랑카",
  "스발바르제도-얀마웬섬",
  "스와질랜드",
  "스웨덴",
  "스위스",
  "스페인",
  "슬로바키아",
  "슬로베니아",
  "시에라리온",
  "신트마르턴",
  "싱가포르",
  "아랍에미리트 연합",
  "아루바",
  "아르메니아",
  "아르헨티나",
  "아메리칸 사모아",
  "아이슬란드",
  "아이티",
  "아일랜드",
  "아제르바이잔",
  "아프가니스탄",
  "안길라",
  "안도라",
  "알바니아",
  "알제리",
  "앙골라",
  "앤티가 바부다",
  "에리트리아",
  "에스토니아",
  "에콰도르",
  "엘살바도르",
  "영국",
  "영국령 버진 아일랜드",
  "영국령인도양식민지",
  "예멘",
  "오만",
  "오스트레일리아",
  "오스트리아",
  "온두라스",
  "올란드 제도",
  "왈리스-푸투나 제도",
  "요르단",
  "우간다",
  "우루과이",
  "우즈베키스탄",
  "우크라이나",
  "이디오피아",
  "이라크",
  "이스라엘",
  "이집트",
  "이탈리아",
  "인도",
  "인도네시아",
  "일본",
  "자메이카",
  "잠비아",
  "저지",
  "적도 기니",
  "중국",
  "중앙 아프리카 공화국",
  "지부티",
  "지브롤터",
  "짐바브웨",
  "차드",
  "체코",
  "칠레",
  "카메룬",
  "카자흐스탄",
  "카타르",
  "캄보디아",
  "캐나다",
  "케냐",
  "케이맨제도",
  "코모로스",
  "코소보",
  "코스타리카",
  "코코스제도",
  "코트디부아르",
  "콜롬비아",
  "콩고",
  "콩고 민주 공화국",
  "쿠바",
  "쿠웨이트",
  "쿡제도",
  "퀴라소",
  "크로아티아",
  "크리스마스섬",
  "키르기스스탄",
  "키리바시",
  "타지키스탄",
  "탄자니아",
  "태국",
  "터크스케이커스제도",
  "터키",
  "토고",
  "토켈라우",
  "통가",
  "투르크메니스탄",
  "투발루",
  "튀니지",
  "트리니다드 토바고",
  "파나마",
  "파라과이",
  "파키스탄",
  "파푸아뉴기니",
  "팔라우",
  "팔레스타인 지구",
  "페로제도",
  "페루",
  "포르투갈",
  "포클랜드 제도(말비나스 군도)",
  "폴란드",
  "푸에르토리코",
  "프랑스",
  "프랑스령 기아나",
  "프랑스령 폴리네시아",
  "피지",
  "핀란드",
  "필리핀",
  "핏케언섬",
  "대한민국",
  "헝가리",
  "홍콩",
];

//* 편의 시설
export const amentityList = [
  "무선 인터넷",
  "TV",
  "난방",
  "에어컨",
  "다리미",
  "샴푸",
  "헤어 드라이어",
  "조식, 커피, 차",
  "업무가능 공간/책상",
  "벽난로",
  "옷장/서랍장",
  "게스트 전용 출입문",
];

//* 편의 공간
export const convinienceList = [
  "주방",
  "세탁 공간 - 세탁기",
  "주차",
  "헬스장",
  "수영장",
  "자쿠지",
];
