export function extractDomain(url: string): string {
    let domain = url.replace(/^(https?:\/\/)?/i, '');
    
    domain = domain.split('/')[0];
    domain = domain.split('?')[0].split('#')[0];
    domain = domain.replace(/^www\./i, '');

    const parts = domain.split('.');
    if (parts.length > 2) {
        domain = parts.slice(-2).join('.');
    }

    return domain;
}