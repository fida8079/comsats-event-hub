import Link from "next/link";

export default function Footer() {
    return (
        <footer className="border-t border-border bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Brand */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-purple to-brand-blue flex items-center justify-center text-white font-bold text-xs">
                                CUI
                            </div>
                            <span className="text-lg font-bold text-foreground">
                                Event Hub
                            </span>
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            COMSATS University Islamabad
                            <br />
                            Event Management System
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div className="space-y-3">
                        <h4 className="text-sm font-semibold text-foreground uppercase tracking-wider">
                            Quick Links
                        </h4>
                        <div className="space-y-2">
                            <Link
                                href="/"
                                className="block text-sm text-muted-foreground hover:text-brand-purple transition-colors"
                            >
                                Home
                            </Link>
                            <Link
                                href="/#events"
                                className="block text-sm text-muted-foreground hover:text-brand-purple transition-colors"
                            >
                                Events
                            </Link>
                            <Link
                                href="/login"
                                className="block text-sm text-muted-foreground hover:text-brand-purple transition-colors"
                            >
                                Login
                            </Link>
                            <Link
                                href="/register"
                                className="block text-sm text-muted-foreground hover:text-brand-purple transition-colors"
                            >
                                Register
                            </Link>
                        </div>
                    </div>

                    {/* Contact */}
                    <div className="space-y-3">
                        <h4 className="text-sm font-semibold text-foreground uppercase tracking-wider">
                            Contact
                        </h4>
                        <div className="space-y-2 text-sm text-muted-foreground">
                            <p>Park Road, Chak Shahzad</p>
                            <p>Islamabad, Pakistan</p>
                            <p>info@comsats.edu.pk</p>
                        </div>
                    </div>
                </div>

                <div className="border-t border-border mt-10 pt-6 text-center">
                    <p className="text-xs text-muted-foreground">
                        &copy; {new Date().getFullYear()} COMSATS University Islamabad. All
                        rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
}
