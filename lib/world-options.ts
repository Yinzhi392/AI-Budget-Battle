export type SelectOption = {
  code: string;
  label: string;
};

const worldRegionCodes = [
  "AD",
  "AE",
  "AF",
  "AG",
  "AI",
  "AL",
  "AM",
  "AO",
  "AQ",
  "AR",
  "AS",
  "AT",
  "AU",
  "AW",
  "AX",
  "AZ",
  "BA",
  "BB",
  "BD",
  "BE",
  "BF",
  "BG",
  "BH",
  "BI",
  "BJ",
  "BL",
  "BM",
  "BN",
  "BO",
  "BQ",
  "BR",
  "BS",
  "BT",
  "BV",
  "BW",
  "BY",
  "BZ",
  "CA",
  "CC",
  "CD",
  "CF",
  "CG",
  "CH",
  "CI",
  "CK",
  "CL",
  "CM",
  "CN",
  "CO",
  "CR",
  "CU",
  "CV",
  "CW",
  "CX",
  "CY",
  "CZ",
  "DE",
  "DJ",
  "DK",
  "DM",
  "DO",
  "DZ",
  "EC",
  "EE",
  "EG",
  "EH",
  "ER",
  "ES",
  "ET",
  "FI",
  "FJ",
  "FK",
  "FM",
  "FO",
  "FR",
  "GA",
  "GB",
  "GD",
  "GE",
  "GF",
  "GG",
  "GH",
  "GI",
  "GL",
  "GM",
  "GN",
  "GP",
  "GQ",
  "GR",
  "GS",
  "GT",
  "GU",
  "GW",
  "GY",
  "HK",
  "HM",
  "HN",
  "HR",
  "HT",
  "HU",
  "ID",
  "IE",
  "IL",
  "IM",
  "IN",
  "IO",
  "IQ",
  "IR",
  "IS",
  "IT",
  "JE",
  "JM",
  "JO",
  "JP",
  "KE",
  "KG",
  "KH",
  "KI",
  "KM",
  "KN",
  "KP",
  "KR",
  "KW",
  "KY",
  "KZ",
  "LA",
  "LB",
  "LC",
  "LI",
  "LK",
  "LR",
  "LS",
  "LT",
  "LU",
  "LV",
  "LY",
  "MA",
  "MC",
  "MD",
  "ME",
  "MF",
  "MG",
  "MH",
  "MK",
  "ML",
  "MM",
  "MN",
  "MO",
  "MP",
  "MQ",
  "MR",
  "MS",
  "MT",
  "MU",
  "MV",
  "MW",
  "MX",
  "MY",
  "MZ",
  "NA",
  "NC",
  "NE",
  "NF",
  "NG",
  "NI",
  "NL",
  "NO",
  "NP",
  "NR",
  "NU",
  "NZ",
  "OM",
  "PA",
  "PE",
  "PF",
  "PG",
  "PH",
  "PK",
  "PL",
  "PM",
  "PN",
  "PR",
  "PS",
  "PT",
  "PW",
  "PY",
  "QA",
  "RE",
  "RO",
  "RS",
  "RU",
  "RW",
  "SA",
  "SB",
  "SC",
  "SD",
  "SE",
  "SG",
  "SH",
  "SI",
  "SJ",
  "SK",
  "SL",
  "SM",
  "SN",
  "SO",
  "SR",
  "SS",
  "ST",
  "SV",
  "SX",
  "SY",
  "SZ",
  "TC",
  "TD",
  "TF",
  "TG",
  "TH",
  "TJ",
  "TK",
  "TL",
  "TM",
  "TN",
  "TO",
  "TR",
  "TT",
  "TV",
  "TW",
  "TZ",
  "UA",
  "UG",
  "UM",
  "US",
  "UY",
  "UZ",
  "VA",
  "VC",
  "VE",
  "VG",
  "VI",
  "VN",
  "VU",
  "WF",
  "WS",
  "YE",
  "YT",
  "ZA",
  "ZM",
  "ZW",
] as const;
const fallbackCurrencyCodes = ["CNY", "USD", "MYR", "SGD", "EUR", "GBP", "JPY", "KRW", "AUD", "CAD"];
const optionCache = new Map<string, SelectOption[]>();

type IntlWithSupportedValues = typeof Intl & {
  supportedValuesOf?: (key: "region" | "currency") => string[];
};

export function getWorldRegionOptions(locale = "zh-CN"): SelectOption[] {
  const cacheKey = `region:${locale}`;
  const cached = optionCache.get(cacheKey);
  if (cached) {
    return cached;
  }

  const regionNames = new Intl.DisplayNames([locale], { type: "region" });
  const codes = getSupportedValues("region", worldRegionCodes);

  const options = codes
    .map((code) => ({ code, label: regionNames.of(code) ?? code }))
    .sort((left, right) => left.label.localeCompare(right.label, locale));
  optionCache.set(cacheKey, options);
  return options;
}

export function getWorldCurrencyOptions(locale = "zh-CN"): SelectOption[] {
  const cacheKey = `currency:${locale}`;
  const cached = optionCache.get(cacheKey);
  if (cached) {
    return cached;
  }

  const currencyNames = new Intl.DisplayNames([locale], { type: "currency" });
  const codes = getSupportedValues("currency", fallbackCurrencyCodes);

  const options = codes
    .map((code) => ({ code, label: `${code} - ${currencyNames.of(code) ?? code}` }))
    .sort((left, right) => left.code.localeCompare(right.code, "en"));
  optionCache.set(cacheKey, options);
  return options;
}

export function isSupportedWorldRegionCode(value: string) {
  return getSupportedValues("region", worldRegionCodes).includes(value);
}

export function isSupportedWorldCurrencyCode(value: string) {
  return getSupportedValues("currency", fallbackCurrencyCodes).includes(value);
}

function getSupportedValues(key: "region" | "currency", fallback: readonly string[]) {
  const intl = Intl as IntlWithSupportedValues;
  const values = key === "region" ? [...fallback] : intl.supportedValuesOf?.(key) ?? [...fallback];
  return [...new Set(values)].filter((value) =>
    key === "region" ? /^([A-Z]{2}|[0-9]{3})$/.test(value) : /^[A-Z]{3}$/.test(value),
  );
}
