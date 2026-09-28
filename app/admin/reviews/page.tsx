import type { Metadata } from "next";
import { ActionForm } from "@/components/admin/ActionForm";
import { ConfirmSubmit } from "@/components/admin/ConfirmSubmit";
import { deleteReview, saveReview } from "@/lib/actions";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = { title: "Desk reviews" };

export default async function AdminReviewsPage() {
  const reviews = await prisma.review.findMany({ orderBy: { sortOrder: "asc" } });

  return (
    <main>
      <section className="page-hero">
        <p className="eyebrow">Reviews</p>
        <h1>Guest notes</h1>
      </section>
      <ActionForm action={saveReview}>
        <h2>Add review</h2>
        <label>
          Guest
          <input name="guestName" required />
        </label>
        <label>
          Service
          <input name="service" required />
        </label>
        <div className="form-row two">
          <label>
            Rating
            <input type="number" name="rating" min={1} max={5} defaultValue={5} />
          </label>
          <label>
            Sort
            <input type="number" name="sortOrder" defaultValue={reviews.length + 1} />
          </label>
        </div>
        <label>
          Quote
          <textarea name="quote" required />
        </label>
        <label className="inline-check">
          <input type="checkbox" name="published" defaultChecked /> Published
        </label>
        <button className="btn btn-primary" type="submit">
          Add
        </button>
      </ActionForm>
      {reviews.map((review) => (
        <div key={review.id}>
          <ActionForm action={saveReview}>
            <input type="hidden" name="id" value={review.id} />
            <label>
              Guest
              <input name="guestName" defaultValue={review.guestName} required />
            </label>
            <label>
              Service
              <input name="service" defaultValue={review.service} required />
            </label>
            <div className="form-row two">
              <label>
                Rating
                <input type="number" name="rating" min={1} max={5} defaultValue={review.rating} />
              </label>
              <label>
                Sort
                <input type="number" name="sortOrder" defaultValue={review.sortOrder} />
              </label>
            </div>
            <label>
              Quote
              <textarea name="quote" defaultValue={review.quote} required />
            </label>
            <label className="inline-check">
              <input type="checkbox" name="published" defaultChecked={review.published} /> Published
            </label>
            <button className="btn btn-line" type="submit">
              Save
            </button>
          </ActionForm>
          <ActionForm action={deleteReview}>
            <input type="hidden" name="id" value={review.id} />
            <ConfirmSubmit label="Delete review" message="Delete this review?" />
          </ActionForm>
        </div>
      ))}
    </main>
  );
}
