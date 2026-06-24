export type SeasonTwelveId =
  | 'light_spring'
  | 'true_spring'
  | 'bright_spring'
  | 'light_summer'
  | 'true_summer'
  | 'soft_summer'
  | 'soft_autumn'
  | 'true_autumn'
  | 'deep_autumn'
  | 'deep_winter'
  | 'true_winter'
  | 'bright_winter';

const SEASON_TWELVE_IDS: readonly SeasonTwelveId[] = [
  'light_spring',
  'true_spring',
  'bright_spring',
  'light_summer',
  'true_summer',
  'soft_summer',
  'soft_autumn',
  'true_autumn',
  'deep_autumn',
  'deep_winter',
  'true_winter',
  'bright_winter',
] as const;

function isSeasonTwelveId(key: string): key is SeasonTwelveId {
  return (SEASON_TWELVE_IDS as readonly string[]).includes(key);
}

/** HEX без #; дополняйте палитры для каждого seasonal_twelve */
export const COLOROTYPE_PALETTES: Record<SeasonTwelveId, readonly string[]> = {
  light_spring: ['EBDCC5', 'ECD8B5', 'D4BD9D', 'D0CBA3', '676C65', 'CDCABB', '7A7A6E', '606A61', '7D6052', '705951', 'EEE17E', 'F1C96E', 'F2C168', 'F1C096', 'F3A082', 'BFDE97', '7AC56A', '55B752', '82D3CD', '53C2B9', '6EB3DC', '30B4C8', '248A9A', '9686BE', '625188'],
  true_spring: ['F6E3C0', 'FCD7A3', 'E5AC81', 'B89366', '453628', 'F1CE7A', 'E8B058', '6E5234', '884633', '643229', 'C3C5B7', '949182', '5A4C43', 'D6CB89', '8F9936', '78DD77', '2D9036', '0F7047', '28C4B7', '1D9280', 'A0B5E6', '5B81CC', '11416C', '976BB6', '3F3D82'],
  bright_spring: ['E2E3D5', 'E7D8BB', 'D7C8B4', 'C1C4B3', '969F9E', 'FACF64', 'ECA946', 'A64433', 'F8825A', 'DC4B42', 'F7B3B2', 'F19386', 'F5A5C0', 'D74A70', 'D2445A', 'E4E2A7', 'C4DC79', '90BC4B', '138A4A', '185E3A', '9EE4EE', '29ABB9', 'B9C2F2', '9E79C6', '382F70'],
  light_summer: ['E0DCD4', 'BDBAAF', '817A76', 'A9ADAE', '697173', 'F3D5AA', 'F3D587', 'F7CA7A', 'B6959B', '5D3441', 'F7919C', 'F75661', 'D52C4C', 'F694B3', 'C4446B', '00D6B3', '009F7E', '00644A', '71909B', '3D6573', '52C5E4', '0063A3', '6893D0', '00407C', '534382'],
  true_summer: ['DCDACD', 'BEBCB0', '605752', 'E9E1A2', 'E2D69A', '7E8176', '5B5851', 'B9AFAD', '6F6065', '4A4448', 'F2778C', 'AC3E5B', '722D3F', 'FDC4D7', '852F54', '64C7AB', '1F7960', '135756', '198762', '184832', '5DC0DF', '8AC0E4', '346EA0', '7E80B3', '504776'],
  soft_summer: ['E8E4E1', 'BCB5B2', 'ACA8A2', 'B2ADAA', 'A6A29A', 'C3A9A6', 'B5969C', 'A98C96', '9D7786', '8D6778', '9FACBC', '8EA2B4', '8799A9', '9CACA3', '8CA59C', 'BEB5CE', 'ACA2C2', '9D8FB8', '8F80AB', '80709B', '60636D', '4C576A', '566476', '615D6B', '70606A'],
  soft_autumn: ['D9DAD4', 'E0DFCB', 'B9AE92', 'F0CC85', 'F7C482', 'F8C3CA', 'F7CCC6', 'F6A796', 'E1706C', 'C4485B', 'D3A67C', '84514E', '633535', '502D31', '443634', '91D8B8', '399F92', '328A71', '256850', '164036', '5CACC9', '4E6DA4', '1E3356', '4D567F', '25304B'],
  true_autumn: ['EEDDC3', 'CDC5B0', 'EDD6A4', 'F7C35E', 'D7A252', 'F7BAAB', 'ED8A89', 'FC6B6B', 'C72B36', '6F2732', '8A837C', '71604C', '513D3C', '3F3333', '48282F', 'B9C0A1', '7C8268', '79B761', '2A783A', '1B3528', '33AFB4', '1B757A', '114652', '6D5585', '463255'],
  deep_autumn: ['E3D7BF', 'EDD1AC', 'CEA97F', 'C5BCB2', 'A59683', 'F2A476', 'E77A66', 'C37A5B', 'E87870', 'CB4C57', 'BE5752', '6E3734', '732C34', 'D63A48', '4C1D27', 'CCD5A0', 'AEC167', '889952', '827843', '2A2E27', '98D8CD', '53C8BC', '14636A', '1C3E57', '1F3147'],
  deep_winter: ['BABABA', '666666', '404447', 'F2E699', 'CCA83B', 'E9D0D5', 'DB85A2', 'BB1D52', 'BC4984', '542146', 'BF1C36', '711A2A', '650000', '8E669D', '4C2B51', '00607D', '005559', '0E4341', '4A753D', '234A37', '006EB3', '0B4B8E', '101D68', 'F6F6F6', '050505'],
  true_winter: ['E6E5EA', 'A3989B', '7F717A', '93969F', '3A424D', 'F3E163', 'E8CA5B', 'F3D5E8', 'DA55A5', '9F386F', '9C3E76', '7A2F58', '632C55', '8A559D', '483867', '5FBA83', '287C6B', '203D40', 'CACFF3', '4B3B84', 'BDE9F7', '42A1E6', '203458', 'F6F6F6', '201F26'],
  bright_winter: ['DDDBCF', '9C9A95', '615B55', '969C96', '3E403F', 'E8DEA3', 'F5C75E', 'A7CE4E', '16A753', '136339', 'EF7A82', 'D0343A', '9B2744', 'C92946', '852134', '4BC2E3', '135C78', 'C44591', '672145', '642C67', '867BC2', '5F57A3', '302E6B', 'F7F7F7', '151412'],
};

export function getColorotypePalette(seasonTwelve: string | undefined): string[] {
  if (seasonTwelve === undefined || seasonTwelve.trim() === '') {
    return [];
  }
  const key = seasonTwelve.trim().toLowerCase();
  if (!isSeasonTwelveId(key)) {
    return [];
  }
  const palette = COLOROTYPE_PALETTES[key];
  return palette.length > 0 ? [...palette] : [];
}
