import type { Metadata } from "next";
import { ActionForm } from "@/components/admin/ActionForm";
import { FormActions } from "@/components/admin/AdminList";
import { editorKeys, MasterDetail, resolveSelection, type MDGroup } from "@/components/admin/MasterDetail";
import { MediaField } from "@/components/admin/MediaField";
import { deleteReview, saveReview } from "@/lib/actions";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = { title: "Desk reviews" };

const BASE = "/admin/reviews";

export default async function AdminReviewsPage({ searchParams }: { searchParams: Promise<{ edit?: string }> }) {
  const params = await searchParams;
  const reviews = await prisma.review.findMany({ orderBy: { sortOrder: "asc" } });

  const groups: MDGroup[] = [
    {
      key: "reviews",
      label: "Reviews",
      noun: "review",
      items: reviews.map((review) => ({
        id: review.id,
        title: review.guestName,
        subtitle: review.service,
        meta: "★".repeat(review.rating),
        hidden: !review.published,
      })),
    },
  ];
  const selection = resolveSelection(groups, params);
  const review = reviews.find((entry) => entry.id === selection.item?.id);
  const { key, deleteFormId } = editorKeys(selection);

  return (
    <main>
      <section className="page-hero">
        <p className="eyebrow">Reviews</p>
        <h1>Guest notes</h1>
      </section>
      <MasterDetail basePath={BASE} groups={groups} selection={selection}>
        <ActionForm key={key} action={saveReview} createdHref={`${BASE}?edit=`}>
          {review ? <input type="hidden" name="id" value={review.id} /> : null}
          <div className="admin-fields">
            <label>
              Guest
              <input name="guestName" defaultValue={review?.guestName} required />
            </label>
            <label>
              Service
              <input name="service" defaultValue={review?.service} required />
            </label>
            <label>
              Rating
              <input type="number" name="rating" min={1} max={5} defaultValue={review?.rating ?? 5} />
            </label>
            <label>
              Order
              <input type="number" name="sortOrder" defaultValue={review?.sortOrder ?? reviews.length + 1} />
            </label>
            <label className="is-wide">
              Quote
              <textarea name="quote" defaultValue={review?.quote} rows={5} required />
            </label>
          </div>
          <MediaField initialMediaUrls={review?.mediaUrls} />
          <label className="inline-check">
            <input type="checkbox" name="published" defaultChecked={review?.published ?? true} /> Published
          </label>
          <FormActions
            saveLabel={review ? "Save changes" : "Add review"}
            deleteFormId={review ? deleteFormId : undefined}
            deleteMessage="Delete this review?"
          />
        </ActionForm>
        {review ? (
          <ActionForm key={`delete-${selection.group.key}`} id={deleteFormId} action={deleteReview} className="admin-delete-form" successHref={BASE}>
            <input type="hidden" name="id" value={review.id} />
          </ActionForm>
        ) : null}
      </MasterDetail>
    </main>
  );
}
