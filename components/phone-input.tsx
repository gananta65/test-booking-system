"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const COUNTRY_CODES = [
  { code: "+1", country: "USA/Canada" },
  { code: "+44", country: "UK" },
  { code: "+91", country: "India" },
  { code: "+86", country: "China" },
  { code: "+81", country: "Japan" },
  { code: "+33", country: "France" },
  { code: "+49", country: "Germany" },
  { code: "+39", country: "Italy" },
  { code: "+34", country: "Spain" },
  { code: "+61", country: "Australia" },
  { code: "+64", country: "New Zealand" },
  { code: "+55", country: "Brazil" },
  { code: "+52", country: "Mexico" },
  { code: "+31", country: "Netherlands" },
  { code: "+46", country: "Sweden" },
  { code: "+47", country: "Norway" },
  { code: "+45", country: "Denmark" },
  { code: "+41", country: "Switzerland" },
  { code: "+43", country: "Austria" },
  { code: "+32", country: "Belgium" },
  { code: "+60", country: "Malaysia" },
  { code: "+65", country: "Singapore" },
  { code: "+66", country: "Thailand" },
  { code: "+62", country: "Indonesia" },
  { code: "+63", country: "Philippines" },
];

interface PhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  required?: boolean;
}

export function PhoneInput({
  value,
  onChange,
  error,
  required,
}: PhoneInputProps) {
  const [countryCode, setCountryCode] = useState("+1");
  const [phoneNumber, setPhoneNumber] = useState("");

  const handlePhoneChange = (phone: string) => {
    setPhoneNumber(phone);
    const fullNumber = `${countryCode} ${phone}`.trim();
    onChange(fullNumber);
  };

  const handleCountryCodeChange = (code: string) => {
    setCountryCode(code);
    const fullNumber = `${code} ${phoneNumber}`.trim();
    onChange(fullNumber);
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">
        Phone Number {required && <span className="text-destructive">*</span>}
      </label>
      <div className="flex gap-2">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-24 bg-transparent">
              {countryCode}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-48 p-0" align="start">
            <div className="max-h-64 overflow-y-auto">
              {COUNTRY_CODES.map((item) => (
                <button
                  key={item.code}
                  onClick={() => handleCountryCodeChange(item.code)}
                  className="w-full text-left px-4 py-2 hover:bg-muted transition-colors text-sm"
                >
                  <span className="font-medium">{item.code}</span>
                  <span className="text-muted-foreground ml-2">
                    {item.country}
                  </span>
                </button>
              ))}
            </div>
          </PopoverContent>
        </Popover>
        <Input
          type="tel"
          placeholder="Enter your phone number"
          value={phoneNumber}
          onChange={(e) => handlePhoneChange(e.target.value)}
          className={error ? "border-destructive" : ""}
        />
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
