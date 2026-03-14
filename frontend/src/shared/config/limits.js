// frontend/src/shared/config/limits.js

export const TEXT_LIMITS = {
    SITE_NAME: 60,
    SITE_SLUG: 30,
    
    PRODUCT_NAME: 120,
    CATEGORY_NAME: 40,
    SKU: 20,
    
    SEO_TITLE: 60,
    SEO_DESC: 160,
    
    USERNAME: 30,
    BIO: 250,
    
    TICKET_SUBJECT: 100,
    TICKET_MESSAGE: 1000
};

export const FILE_LIMITS = {
    TICKET_ATTACHMENT: {
        MAX_SIZE: 5 * 1024 * 1024,
        MAX_FILES: 5
    },
    MEDIA_LIBRARY: {
        MAX_SIZE: 16 * 1024 * 1024,
        MAX_FILES: 10
    },
    GENERAL_IMAGE: {
        MAX_SIZE: 15 * 1024 * 1024
    }
};