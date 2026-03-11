"use client";

import dynamic from "next/dynamic";
import React from 'react';

const Chatbot = dynamic(() => import('@/components/Chatbot'), { ssr: false });

export const ChatbotProvider = () => <Chatbot />;