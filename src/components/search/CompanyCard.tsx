"use client";

import React from "react";
import Image from "next/image";
import { Building2, Film, ChevronRight } from "lucide-react";
import { TMDBCompany, getImageUrl } from "@/lib/tmdb/client";

interface CompanyCardProps {
  company: TMDBCompany;
  onSelectCompany: (company: TMDBCompany) => void;
}

export function CompanyCard({ company, onSelectCompany }: CompanyCardProps) {
  return (
    <div className="group relative flex flex-col justify-between bg-[#141420] border border-white/10 hover:border-red-500/40 rounded-2xl p-4 transition-all duration-300 hover:shadow-xl hover:shadow-red-950/20 hover:-translate-y-1">
      {/* Logo container with sleek contrast background */}
      <div className="relative w-full h-24 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center p-3 overflow-hidden group-hover:bg-white/10 transition-colors">
        {company.logo_path ? (
          <div className="relative w-full h-full">
            <Image
              src={getImageUrl(company.logo_path, "w300")}
              alt={company.name}
              fill
              className="object-contain filter drop-shadow brightness-90 group-hover:brightness-100 transition-all duration-300"
              sizes="200px"
            />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center text-zinc-500 gap-1">
            <Building2 className="w-8 h-8 text-zinc-600 group-hover:text-red-400 transition-colors" />
            <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-500">
              Estudio
            </span>
          </div>
        )}

        {/* Origin Country Badge */}
        {company.origin_country && (
          <span className="absolute top-2 right-2 px-1.5 py-0.5 rounded bg-black/60 backdrop-blur-sm border border-white/10 text-[10px] font-bold text-zinc-300">
            {company.origin_country}
          </span>
        )}
      </div>

      {/* Info and Action */}
      <div className="mt-3">
        <h3 className="font-bold text-sm sm:text-base text-white group-hover:text-red-400 transition-colors truncate">
          {company.name}
        </h3>
        <p className="text-[11px] text-zinc-400 mt-0.5">
          Productora cinematográfica
        </p>

        <button
          onClick={() => onSelectCompany(company)}
          className="mt-3 w-full py-2 px-3 rounded-xl bg-white/10 hover:bg-red-600 text-white font-semibold text-xs transition flex items-center justify-center gap-1.5 active:scale-95"
        >
          <Film className="w-3.5 h-3.5" />
          <span>Ver catálogo de películas</span>
          <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>
    </div>
  );
}
