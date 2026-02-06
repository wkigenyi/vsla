import * as React from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface MoneyInputProps
    extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange" | "value"> {
    value: number;
    onChange: (value: number) => void;
    currencySymbol?: string;
}

const MoneyInput = React.forwardRef<HTMLInputElement, MoneyInputProps>(
    ({ className, value, onChange, currencySymbol = "UGX", ...props }, ref) => {
        const [displayValue, setDisplayValue] = React.useState("");

        // Update display value when the prop value changes
        React.useEffect(() => {
            if (value === 0 && displayValue === "") return; // Don't override user clearing input
            if (value !== undefined && !isNaN(value)) {
                setDisplayValue(value.toLocaleString());
            } else {
                setDisplayValue("");
            }
        }, [value]);

        const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            const inputValue = e.target.value;

            // Remove commas and non-numeric characters (except for maybe decimal point if needed, but we typically stick to integers for UGX)
            const rawValue = inputValue.replace(/,/g, "").replace(/\D/g, "");

            const numericValue = parseInt(rawValue) || 0;

            // Update local display immediately for responsiveness
            if (rawValue === "") {
                setDisplayValue("");
                onChange(0);
            } else {
                setDisplayValue(parseInt(rawValue).toLocaleString());
                onChange(numericValue);
            }
        };

        return (
            <div className="relative">
                <Input
                    type="text"
                    inputMode="numeric"
                    className={cn("pr-12 text-right font-mono", className)}
                    {...props}
                    value={displayValue}
                    onChange={handleChange}
                    ref={ref}
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground pointer-events-none">
                    {currencySymbol}
                </div>
            </div>
        );
    }
);
MoneyInput.displayName = "MoneyInput";

export { MoneyInput };
