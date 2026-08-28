import type { Metadata } from "next";
import { testimonialRepository } from "@/features/testimonials/repositories/testimonial.repository";
import { TestimonialsTable } from "@/features/testimonials/components/testimonials-table";
import { AddTestimonialForm } from "@/features/testimonials/components/add-testimonial-form";

export const metadata: Metadata = { title: "Testimonials — Admin" };

export default async function AdminTestimonialsPage() {
  const testimonials = await testimonialRepository.findAll();

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Testimonials</h1>
        <p className="text-sm text-muted-foreground">
          {testimonials.length} total · {testimonials.filter((t) => !t.isApproved).length} pending
          approval
        </p>
      </div>

      <AddTestimonialForm />

      {testimonials.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border py-16 text-center">
          <p className="text-sm text-muted-foreground">No testimonials yet.</p>
        </div>
      ) : (
        <TestimonialsTable testimonials={testimonials} />
      )}
    </div>
  );
}
