/**
 * Prime One — admin product create/edit form.
 */
import { api } from '../api.js';
import { escapeHtml } from '../helpers.js';
import { url } from '../config.js';

const id = new URLSearchParams(location.search).get('id');

async function init() {
  const [categoriesRes] = await Promise.all([api.get('/api/admin/categories')]);
  const categories = (categoriesRes.data || []).filter((c) => !c.parent_id);

  let product = { title: '', price: '', stock: 0, status: 'active', features: [], tags: [] };
  if (id) {
    try {
      const res = await api.get(`/api/admin/products/${id}`);
      product = { ...product, ...res.data };
    } catch (e) {
      document.getElementById('form-root').innerHTML = `<div class="text-red-500">${escapeHtml(e.message)}</div>`;
      return;
    }
  }

  document.getElementById('form-root').innerHTML = `
    <form id="product-form" class="space-y-5" enctype="multipart/form-data">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="md:col-span-2"><label class="label">عنوان محصول *</label><input name="title" class="input" value="${escapeHtml(product.title)}" required/></div>
        <div><label class="label">دسته‌بندی *</label>
          <select name="categoryId" class="input" required>
            ${categories.map((c) => `<option value="${c.id}" ${product.category_id === c.id ? 'selected' : ''}>${escapeHtml(c.name)}</option>`).join('')}
          </select>
        </div>
        <div><label class="label">کد محصول</label><input name="productCode" class="input" value="${escapeHtml(product.product_code || '')}"/></div>
        <div><label class="label">قیمت (تومان) *</label><input name="price" type="number" class="input" value="${product.price || ''}" required/></div>
        <div><label class="label">قیمت با تخفیف</label><input name="discountPrice" type="number" class="input" value="${product.discount_price || ''}"/></div>
        <div><label class="label">موجودی</label><input name="stock" type="number" class="input" value="${product.stock ?? 0}"/></div>
        <div><label class="label">زمان تحویل (ساعت)</label><input name="deliveryHours" type="number" class="input" value="${product.delivery_hours || ''}"/></div>
        <div><label class="label">وضعیت</label>
          <select name="status" class="input">
            ${['active', 'draft', 'out_of_stock', 'discontinued'].map((s) => `<option value="${s}" ${product.status === s ? 'selected' : ''}>${statusFa(s)}</option>`).join('')}
          </select>
        </div>
        <div><label class="label">تگ‌ها (با کاما جدا کنید)</label><input name="tags" class="input" value="${escapeHtml((product.tags || []).join(', '))}"/></div>
      </div>
      <div><label class="label">توضیح کوتاه</label><input name="shortDescription" class="input" value="${escapeHtml(product.short_description || '')}"/></div>
      <div><label class="label">توضیحات کامل</label><textarea name="description" rows="4" class="input">${escapeHtml(product.description || '')}</textarea></div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div><label class="label">تصویر اصلی</label><input name="mainImage" type="file" accept="image/*" class="input !p-2"/></div>
        <div><label class="label">گالری (چند فایل)</label><input name="gallery" type="file" accept="image/*" multiple class="input !p-2"/></div>
      </div>

      <div class="grid grid-cols-2 gap-4">
        <label class="flex items-center gap-2"><input type="checkbox" name="isFeatured" class="accent-[#FFB300] w-4 h-4" ${product.is_featured ? 'checked' : ''}/> ویژه</label>
        <label class="flex items-center gap-2"><input type="checkbox" name="isBestseller" class="accent-[#FFB300] w-4 h-4" ${product.is_bestseller ? 'checked' : ''}/> پرفروش</label>
      </div>

      <div class="flex gap-2 pt-2">
        <button class="btn-primary !px-8" type="submit">ذخیره</button>
        <a href="/pages/admin/" class="btn-ghost">انصراف</a>
      </div>
      <div id="form-msg" class="text-sm"></div>
    </form>`;

  document.getElementById('product-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const form = e.target;
    const fd = new FormData(form);
    const features = [];
    // Collect features dynamically if any rows exist (simplified).
    const payload = {
      title: fd.get('title'),
      categoryId: Number(fd.get('categoryId')),
      productCode: fd.get('productCode') || undefined,
      price: Number(fd.get('price')),
      discountPrice: fd.get('discountPrice') ? Number(fd.get('discountPrice')) : null,
      stock: Number(fd.get('stock')),
      deliveryHours: fd.get('deliveryHours') ? Number(fd.get('deliveryHours')) : null,
      status: fd.get('status'),
      tags: (fd.get('tags') || '').split(',').map((t) => t.trim()).filter(Boolean),
      shortDescription: fd.get('shortDescription') || undefined,
      description: fd.get('description') || undefined,
      isFeatured: fd.get('isFeatured') === 'on',
      isBestseller: fd.get('isBestseller') === 'on',
      features,
    };

    const msg = document.getElementById('form-msg');
    msg.textContent = 'در حال ذخیره...';
    try {
      if (id) {
        await api.put(`/api/admin/products/${id}`, payload);
      } else {
        await api.post('/api/admin/products', payload);
      }
      location.href = url('pages/admin/');
    } catch (err) {
      msg.innerHTML = `<span class="text-red-500">${escapeHtml(err.message)}</span>`;
    }
  });
}

function statusFa(s) {
  return { active: 'فعال', draft: 'پیش‌نویس', out_of_stock: 'ناموجود', discontinued: 'متوقف شده' }[s] || s;
}

init();
