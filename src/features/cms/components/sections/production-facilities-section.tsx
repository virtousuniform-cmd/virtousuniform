import Image from "next/image";
import { productionFacilityRepository } from "@/features/production-facilities/repositories/production-facility.repository";

export async function ProductionFacilitiesSection() {
  const facilities = await productionFacilityRepository.findActive();

  // Hide section if no active facilities
  if (facilities.length === 0) {
    return null;
  }

  return (
    <section className="relative overflow-hidden py-16 sm:py-20 lg:py-24 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl text-white mb-3">
            Production Facilities
          </h2>
          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto">
            From development to final quality inspection, every stage is handled with care and precision.
          </p>
        </div>

        {/* Facilities Grid */}
        <div className="grid gap-6 sm:gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
          {facilities.map((facility) => (
            <div
              key={facility.id}
              className="group relative overflow-hidden rounded-xl aspect-[3/4] md:aspect-[4/5] shadow-lg transition-transform duration-300 hover:scale-105"
            >
              {/* Image */}
              <Image
                src={facility.imageUrl}
                alt={facility.imageAlt || facility.title}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-110"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 25vw, 20vw"
                priority={false}
              />

              {/* Overlay Gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-90 group-hover:opacity-95 transition-opacity duration-300" />

              {/* Content */}
              <div className="absolute inset-0 flex flex-col justify-end p-4 sm:p-5 text-white">
                <div className="space-y-1 sm:space-y-2">
                  <h3 className="text-lg sm:text-xl font-bold tracking-tight">
                    {facility.title}
                  </h3>
                  {facility.description && (
                    <p className="text-xs sm:text-sm text-slate-200 line-clamp-2">
                      {facility.description}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Decorative elements */}
      <div className="absolute top-0 right-0 -mt-40 -mr-40 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl opacity-20" />
      <div className="absolute bottom-0 left-0 -mb-40 -ml-40 w-80 h-80 bg-indigo-500/20 rounded-full blur-3xl opacity-20" />
    </section>
  );
}
