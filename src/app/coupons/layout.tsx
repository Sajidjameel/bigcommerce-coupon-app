import { CouponProvider } from "@/components/Context/CouponContext";
import { ProductSearchProvider } from "@/components/Context/ProductsContext";

export default function CouponLayout({ children }: { children: React.ReactNode }) {
    return (
        <>
            <CouponProvider>
                <ProductSearchProvider>
                    {children}
                </ProductSearchProvider>
            </CouponProvider>
        </>
    );
}
