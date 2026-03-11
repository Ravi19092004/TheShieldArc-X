"use client";

// @ts-ignore
declare const chrome: any;

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../web/components/ui/card";
import { Button } from '../web/components/ui/button';
import { CheckCircle, AlertTriangle, ShieldQuestion, Loader2 } from "lucide-react";

interface ScanData {
  domain: string;
  url: string;
  redirectedUrl?: string;
  prediction: 'Safe' | 'Unsafe' | 'Suspicious' | 'Error';
  confidence: number;
  safe_percentage: number;
  unsafe_percentage: number;
  ip_address?: string;
  asn?: string;
  location?: string;
  country_code?: string;
  hosting_provider?: string;
}

interface PredictMessage {
  type: 'predict';
  url: string;
}

const getFlagEmoji = (countryCode?: string | null) => {
  if (!countryCode) return "";
  const codePoints = countryCode
    .toUpperCase()
    .split("")
    .map((char) => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
};

const Popup = () => {
  const [data, setData] = useState<ScanData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if terms are accepted
    chrome.storage.local.get(['termsAccepted'], (result: { termsAccepted?: boolean }) => {
      if (!result.termsAccepted) {
        // Terms not accepted, open terms page
        chrome.tabs.create({ url: chrome.runtime.getURL('terms.html') });
        window.close(); // Close the popup
        return;
      }

      // Terms accepted, proceed with normal functionality
      const fetchPrediction = async () => {
        try {
          const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
          if (!tabs[0]?.url) {
            setError("Could not get URL of the current tab.");
            return;
          }
          const url = tabs[0].url;

          // Send a message to the background script to get the URL status
          const result = await new Promise<ScanData>((resolve, reject) => {
              chrome.runtime.sendMessage(
              { type: 'predict', url } as PredictMessage,
              (response: ScanData | undefined) => {
                if (chrome.runtime.lastError) {
                return reject(new Error(chrome.runtime.lastError.message));
                }
                if (!response) {
                return reject(new Error("No response from background script."));
                }
                resolve(response);
              }
              );
          });

          const safePercentage = result.prediction === 'Safe' ? (result.safe_percentage ?? (100 - result.confidence * 100)) : (result.safe_percentage ?? 0);
          const unsafePercentage = result.prediction === 'Unsafe' ? (result.unsafe_percentage ?? (result.confidence * 100)) : (result.unsafe_percentage ?? 0);

          setData({
            ...result,
            safe_percentage: safePercentage,
            unsafe_percentage: unsafePercentage,
          });
        } catch (err) {
          setError(err instanceof Error ? err.message : "Unknown error");
        } finally {
          setLoading(false);
        }
      };

      fetchPrediction();
    });
  }, []);

  if (error) {
    return (
      <Card className="m-4 p-4 max-w-sm mx-auto bg-destructive/10 border-destructive">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive"><AlertTriangle /> Error</CardTitle>
        </CardHeader>
        <CardContent className="text-destructive-foreground">{error}</CardContent>
      </Card>
    );
  }

  if (loading || !data) {
    return (
      <Card className="m-4 p-4 max-w-sm mx-auto">
        <CardHeader><CardTitle className="text-center">Scanning...</CardTitle></CardHeader>
        <CardContent className="flex justify-center items-center gap-2">
          <Loader2 className="h-5 w-5 animate-spin" />
          <p>Analyzing current page...</p>
        </CardContent>
      </Card>
    );
  }

  const isSafe = data.prediction === "Safe";
  const isUnsafe = data.prediction === "Unsafe";

  return (
    <Card className="m-4 max-w-sm mx-auto">
      <CardHeader>
        <div className="flex justify-center mb-4">
          <img src={chrome.runtime.getURL('logo.jpg')} alt="DataShield Logo" className="w-20 h-20 object-contain" />
        </div>
        <CardTitle className="text-center">Datashield.Ai Website Checker</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4 font-bold text-lg break-words text-center">{data.domain || "N/A"}</div>
        <div className="mb-2 text-sm text-muted-foreground break-words font-bold">
          <strong>Source URL:</strong> {data.url || "N/A"}
        </div>
        <div className="mb-4 text-sm text-muted-foreground break-words font-bold">
          <strong>Redirected URL:</strong> {data.redirectedUrl || "None"}
        </div>

        <div className="flex items-center gap-2 mb-4">
          <div
            className={`w-6 h-6 rounded-md flex items-center justify-center text-white ${
              isSafe ? "bg-green-400" : isUnsafe ? "bg-red-400" : "bg-yellow-400"
            }`}
          >
            {isSafe && <CheckCircle />}
            {isUnsafe && <AlertTriangle />}
            {!isSafe && !isUnsafe && <ShieldQuestion />}
          </div>
          <div className="font-bold">
            {isSafe ? "Trusted website" : isUnsafe ? "PHISHING DETECTED" : "Unknown status"}
          </div>
        </div>

        <div className="mb-4">
          <div className="text-lg font-bold">
            {data.unsafe_percentage?.toFixed(1)}% Unsafe
          </div>
          <div className="text-sm text-muted-foreground font-bold">
            Safe: {data.safe_percentage?.toFixed(1)}%
          </div>
          <div className="w-full h-4 bg-green-500 rounded-full mt-2 overflow-hidden">
            <div className="h-full bg-red-500" style={{ width: `${data.unsafe_percentage}%` }} />
          </div>
        </div>

        <div className="space-y-2 text-sm font-bold">
          <div><strong>IP Address:</strong> {data.ip_address || "N/A"}</div>
          <div><strong>ASN:</strong> {data.asn || "N/A"}</div>
          <div className="flex items-center">
            <strong>Location:</strong> {getFlagEmoji(data.country_code)} {data.location || "N/A"}
          </div>
          <div><strong>Provider:</strong> {data.hosting_provider || "N/A"}</div>
        </div>

        <Button
          variant="neon"
          className="mt-6 w-full"
          onClick={() => {
            // chrome.tabs.create({ url: "http://localhost:3000/dashboard" });
          }}
        >
          Manage Protection
        </Button>
      </CardContent>
    </Card>
  );
};

export default Popup;
