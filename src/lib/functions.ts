export function extractDomain(url: string): string {
    let domain = url.replace(/^(https?:\/\/)?/i, '');
    
    domain = domain.split('/')[0];
    
    domain = domain.split('?')[0].split('#')[0];
    return domain.replace(/^www\./i, '');
}