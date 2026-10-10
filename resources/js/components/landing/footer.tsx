const columns = [
    {
        title: 'Product',
        links: [
            { href: '#features', label: 'Features' },
            { href: '#pricing', label: 'Pricing' },
            { href: '/register', label: 'Get started' },
        ],
    },
    {
        title: 'Workspace',
        links: [
            { href: '/login', label: 'Log in' },
            { href: '/register', label: 'Sign up' },
            { href: '/login', label: 'Dashboard' },
        ],
    },
    {
        title: 'Company',
        links: [
            { href: '#testimonials', label: 'Customers' },
            { href: '#features', label: 'Product' },
        ],
    },
];

export function Footer() {
    return (
        <footer className="border-border border-t">
            <div className="landing-container py-12 lg:py-16">
                <div className="grid grid-cols-2 gap-8 md:grid-cols-3">
                    {columns.map((column) => (
                        <div key={column.title}>
                            <h3 className="text-base font-semibold">{column.title}</h3>
                            <nav className="mt-4 flex flex-col gap-3">
                                {column.links.map((link) => (
                                    <a key={link.label} href={link.href} className="text-muted-foreground hover:text-foreground text-sm">
                                        {link.label}
                                    </a>
                                ))}
                            </nav>
                        </div>
                    ))}
                </div>
                <div className="border-border mt-12 flex flex-col items-start justify-between gap-2 border-t pt-6 sm:flex-row sm:items-center">
                    <span className="text-base font-semibold">ProjectFlow</span>
                    <p className="text-muted-foreground text-sm">© {new Date().getFullYear()} ProjectFlow. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
}
