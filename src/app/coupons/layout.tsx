import { CouponProvider } from "@/components/Context/CouponContext";

export default function CouponLayout({ children }: { children: React.ReactNode }) {
    return (
        <>
            <CouponProvider>
                {children}
            </CouponProvider>
        </>
    );
}
