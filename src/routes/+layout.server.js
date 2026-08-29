export const load = async ({ locals, cookies }) => {
    const cookieLocale = cookies.get('tnhub-locale');
    const resolvedLocale = cookieLocale === 'ta' || cookieLocale === 'en'
        ? cookieLocale
        : (locals.user?.preferredLanguage === 'ta' || locals.user?.preferredLanguage === 'en' ? locals.user.preferredLanguage : 'en');
    return {
        user: locals.user,
        locale: resolvedLocale
    };
};
