"use client";
import React from 'react';

export default function LoadingState({ message = "Loading..." }) {
  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-4">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600"></div>
      <p className="text-gray-600">{message}</p>
    </div>
  );
}

export function LoadingCard() {
  return (
    <div className="animate-pulse">
      <div className="bg-gray-200 h-48 rounded-t-lg"></div>
      <div className="p-4 space-y-3">
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
      </div>
    </div>
  );
}

export function LoadingGrid({ count = 8 }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {Array(count).fill(0).map((_, index) => (
        <LoadingCard key={index} />
      ))}
    </div>
  );
} 