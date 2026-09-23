# Ananda Yoga - Admin Management Update

This package updates the existing Ananda Yoga project. It is intended to be copied over the existing project; it does NOT require a new Git repository.

## Included changes

- Admin can edit all course details after creation.
- Admin can change original/selling price, status, WhatsApp settings, description, services, benefits and curriculum.
- Admin can delete courses that have no purchase records.
- Courses with purchase records are protected from deletion; set them to Draft instead.
- Admin Orders section shows buyer name, email, phone number, course name, amount, payment status, Razorpay IDs and date.
- Checkout requires a valid 10-digit Indian phone number before creating a Razorpay order.
- Phone number is stored on the order and is available to admin.
- Existing PostgreSQL/SQLite databases are upgraded automatically with the new `orders.phone_number` column.
- `psycopg[binary]` is pinned to 3.2.13 for Render compatibility.

## IMPORTANT

Do NOT overwrite your existing `backend/.env` or `frontend/.env`. This update package intentionally does not include those files.

Do NOT create a new Git repository.

## Apply the update

1. Keep your current project folder and its `.git` folder.
2. Extract this ZIP into the current project folder and choose **Replace** when Windows asks about these source files.
3. Keep your existing `.env` files.
4. In `backend`, make sure the existing virtual environment is still present.
5. Run the backend and frontend locally and test admin editing and checkout.
6. Commit and push from the existing repository.

## Git commands

```powershell
git status
git add backend frontend UPDATE_INSTRUCTIONS.md
git commit -m "Add admin course management and buyer phone details"
git push origin main
```

Render and Vercel should then deploy from the same repositories/services you already configured.
