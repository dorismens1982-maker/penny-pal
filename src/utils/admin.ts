export const ADMIN_EMAILS = [
    'admin@bigsamcreates.com',
    'hello@bigsamcreates.com',
    // Add more admin emails as needed
];

export const isAdminEmail = (email: string | undefined): boolean => {
    if (!email) return false;
    return email.endsWith('@bigsamcreates.com') || ADMIN_EMAILS.includes(email.toLowerCase());
};
