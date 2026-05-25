"use client";

import {ThemeProvider} from "@/components/Theme/theme-provider";
import React from "react";

export function Providers({children}: { children: React.ReactNode }) {
    return <ThemeProvider>{children}</ThemeProvider>;
}