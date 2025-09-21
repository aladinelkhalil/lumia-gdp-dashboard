// AUTO-GENERATED FILE. Run `npm run update:gdp-ids` to refresh.

export type GdpFeedRef = { id: string; base: string; year: number; quarter: 1 | 2 | 3 | 4 };
export const gdpFeeds: GdpFeedRef[] = [
  {
    "id": "b4ae8f99fe948c259bf1c419a8ef3c99f31b6bfbd11b2bd5e960d5ba395ce66e",
    "base": "GDPQ225",
    "year": 2025,
    "quarter": 2
  },
  {
    "id": "76bd1d211bed7f8c553f19cc2da845cab538e8b1d9e317d0455c22950fe4e32c",
    "base": "GDPQ424",
    "year": 2024,
    "quarter": 4
  },
  {
    "id": "a0158865c183a07659de1f7b86dcf7f34c6b9f7982cc2f22b08c1979e3dee8ea",
    "base": "GDPQ323",
    "year": 2023,
    "quarter": 3
  },
  {
    "id": "01da0bbe2e2a28a45eee49168a755321baccf916377337699cf6f23207952623",
    "base": "GDPQ222",
    "year": 2022,
    "quarter": 2
  },
  {
    "id": "4e35cd9a603f66fd85f6128d91a9bc129662e64ed022a97f8d95b59f1ebf7c2e",
    "base": "GDPQ221",
    "year": 2021,
    "quarter": 2
  },
  {
    "id": "e50aec560231dbcdd10e04bcabc4f18fa492e363b08ca9098e10d658931c3457",
    "base": "GDPQ320",
    "year": 2020,
    "quarter": 3
  },
  {
    "id": "d584777f78a2ac22d8eebddd9cf22f9006a74b6da112e0d673bc6a6599c5f7d1",
    "base": "GDPQ422",
    "year": 2022,
    "quarter": 4
  },
  {
    "id": "d7c07f4fea81886c927eb995a5e007987c426c6b04255a0b9cc2063b990175b4",
    "base": "GDPQ223",
    "year": 2023,
    "quarter": 2
  },
  {
    "id": "1f0585497d5749086d2a0d31872e3d54983ae1695fe8daa367f416778401a316",
    "base": "GDPQ125",
    "year": 2025,
    "quarter": 1
  },
  {
    "id": "9fc444f6174a9cf849b65c3b30411ecd68a98136ce7e3727c62256675f7137dc",
    "base": "GDPQ220",
    "year": 2020,
    "quarter": 2
  },
  {
    "id": "ede7d586e573bba4d9f9b598134a0b3b2848fb5633efa1aeae6cdc405ca69ec4",
    "base": "GDPQ120",
    "year": 2020,
    "quarter": 1
  },
  {
    "id": "e007fecd2fa29ae39ca6014752d08240d29ab8d26defda84151a35888dc38f72",
    "base": "GDPQ122",
    "year": 2022,
    "quarter": 1
  },
  {
    "id": "5fd1723f5ae19701812061efdfc487b923260c3186694b1f757bc19b3478c26c",
    "base": "GDPQ224",
    "year": 2024,
    "quarter": 2
  },
  {
    "id": "8cbea9b9b69b80ddeaa00c4ab9dc54f2b1c104f3fb732ece3b70eeb622296d76",
    "base": "GDPQ324",
    "year": 2024,
    "quarter": 3
  },
  {
    "id": "7d52b237e53197baeabb7e8840afc635e804e4c120304850657b7fe9b5abde6b",
    "base": "GDPQ124",
    "year": 2024,
    "quarter": 1
  },
  {
    "id": "849b55be51fdcb722dc58ad870d69f73c3ea3b020fb2a8039e5b7abed62f2a86",
    "base": "GDPQ321",
    "year": 2021,
    "quarter": 3
  },
  {
    "id": "56ef63838b89bae2fa4ceac09887937e3a8ed5882372e9d3c5f5b0047be99201",
    "base": "GDPQ121",
    "year": 2021,
    "quarter": 1
  },
  {
    "id": "f8557de55b0ae56652e6ab325eef49a3e999aba6a37f35c36ac6403713dc11a6",
    "base": "GDPQ322",
    "year": 2022,
    "quarter": 3
  },
  {
    "id": "ed0db24f1d1e79d175b972b2824f17bfdc68adb2b9f0a95bd55001aad9636243",
    "base": "GDPQ123",
    "year": 2023,
    "quarter": 1
  },
  {
    "id": "44aaa6f2845486fd145561c678ab8b24dfba2f685a30755ad70f3b5cf6e8b3b8",
    "base": "GDPQ423",
    "year": 2023,
    "quarter": 4
  },
  {
    "id": "3a683ed0c55b14e1521313d45d93136a5adc9945fa8dca02374f8d9870d4d342",
    "base": "GDPQ421",
    "year": 2021,
    "quarter": 4
  },
  {
    "id": "9700fcc09ccf25204df7e5b87c3cfa7a780ff782c95a39fd5558cf14dbac8591",
    "base": "GDPQ420",
    "year": 2020,
    "quarter": 4
  }
] as const;
export const gdpFeedIds: string[] = gdpFeeds.map((f) => f.id);
export const extraFeedIds: string[] = [
  "3f62a36b5c2b7f0b748b10f184d6a3261028f5284df7d99e2b2239e6f4032911",
  "9117c3ac2f9416e7554642d587122955adfb3eb6c6211de805f99f7ac935dce5",
  "bb733ae406970581ee2bce323e04943c2ff25fcfd23b98bddf6880fecd42d5b0",
  "4c0d5dee9001331f1258546e159f7bb91357051fe9fc8252345a184a59be4ac2"
];
export const allFeedIds: string[] = [...gdpFeedIds, ...extraFeedIds];
