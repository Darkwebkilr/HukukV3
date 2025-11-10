import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";
import sitemap from "@astrojs/sitemap";
import cloudflare from "@astrojs/cloudflare";

const SITE_URL = "https://enessevinc.com";

// Helper function to fetch all items from a paginated WordPress API endpoint
async function fetchAllFromWp(endpoint) {
  let allItems = [];
  let page = 1;
  let totalPages = 1;

  while (page <= totalPages) {
    const response = await fetch(`${endpoint}?per_page=100&page=${page}`);

    const totalPagesHeader = response.headers.get("X-WP-TotalPages");
    if (totalPagesHeader) {
      totalPages = parseInt(totalPagesHeader, 10);
    }

    const items = await response.json();

    if (items && items.length > 0) {
      allItems = allItems.concat(items);
    } else {
      break;
    }

    page++;
  }

  return allItems;
}

async function getDynamicRoutes() {
  console.log("Sitemap için dinamik URL'ler çekiliyor...");

  const [posts, allCategories] = await Promise.all([
    fetchAllFromWp("https://n6j.7b0.myftpupload.com/wp-json/wp/v2/posts"),
    fetchAllFromWp("https://n6j.7b0.myftpupload.com/wp-json/wp/v2/categories"),
  ]);

  console.log(
    `${posts.length} yazı ve ${allCategories.length} kategori bulundu.`,
  );

  const arastirmalarParent = allCategories.find(
    (c) => c.slug === "arastirmalar",
  );
  const arastirmalarParentId = arastirmalarParent
    ? arastirmalarParent.id
    : null;

  const researchCategoryIds = arastirmalarParentId
    ? allCategories
        .filter((c) => c.parent === arastirmalarParentId)
        .map((c) => c.id)
    : [];

  const pages = posts.map((post) => {
    const postIsResearch = post.categories.some((catId) =>
      researchCategoryIds.includes(catId),
    );

    let path;
    if (postIsResearch) {
      const categoryId = post.categories.find((catId) =>
        researchCategoryIds.includes(catId),
      );
      const categoryDetails = allCategories.find((c) => c.id === categoryId);
      if (categoryDetails) {
        path = `/arastirmalar/${categoryDetails.slug}/${post.slug}`;
      }
    } else {
      path = `/blog/${post.slug}`;
    }

    // Return the full URL for the sitemap
    if (path) {
      return new URL(path, SITE_URL).href;
    }
    return null;
  });

  const validPages = pages.filter(Boolean);
  console.log(`Sitemap için ${validPages.length} geçerli URL oluşturuldu.`);
  console.log("Örnek URL'ler:", validPages.slice(0, 5));

  return validPages;
}

// https://astro.build/config
export default defineConfig({
  site: SITE_URL,
  integrations: [
    tailwind(),
    sitemap({
      // This function is now called during the build process
      customPages: await getDynamicRoutes(),
      // Exclude the search page from the sitemap
      filter: (page) => new URL(page).pathname !== "/arama/",
    }),
  ],
  adapter: cloudflare(),
});
