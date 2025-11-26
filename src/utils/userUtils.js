export const getUserAvatar = (user) => {
  if (!user) return null;

  const directPhoto = user.photoURL || user.reloadUserInfo?.photoUrl;
  if (directPhoto) return directPhoto;

  const providerPhoto = user.providerData?.find(
    (provider) => provider.photoURL
  )?.photoURL;

  return providerPhoto || null;
};


