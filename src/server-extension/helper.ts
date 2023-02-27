export const decodedAssetId = (assetId: string) => {
  return assetId.replaceAll('#', '"');
};

export const encodedAssetId = (assetId: string) => {
  return assetId.substring(assetId.indexOf('['), assetId.indexOf(']') + 1).replaceAll('"', '#');
};

export const mergeByField = (array1: any[], array2: any[], field: string) =>
  array1.map((a1) => ({
    ...a1,
    ...array2.find((a2) => a2[field].toString() == a1[field].toString() && a2),
  }));
