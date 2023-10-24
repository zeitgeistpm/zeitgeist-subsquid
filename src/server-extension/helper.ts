export const decodedAssetId = (assetId: string) => {
  return assetId.replaceAll('#', '"');
};

export const encodedAssetId = (assetId: string) => {
  return assetId.substring(assetId.indexOf('['), assetId.indexOf(']') + 1).replaceAll('"', '#');
};
