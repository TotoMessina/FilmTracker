import { NextRequest, NextResponse } from "next/server";
import oscarsDb from "@/lib/data/oscars_db.json";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const yearParam = searchParams.get("year");
    const ceremonyParam = searchParams.get("ceremony");
    const categoryParam = searchParams.get("category");
    const queryParam = searchParams.get("q");

    // 1. By Specific Year or Ceremony
    if (yearParam || ceremonyParam) {
      const targetYear = yearParam ? parseInt(yearParam, 10) : null;
      const targetCeremony = ceremonyParam ? parseInt(ceremonyParam, 10) : null;

      const edition = oscarsDb.editions.find(
        (e) => (targetYear && e.year === targetYear) || (targetCeremony && e.ceremony === targetCeremony)
      );

      if (!edition) {
        return NextResponse.json({ error: "Edición no encontrada" }, { status: 404 });
      }

      return NextResponse.json({ edition, categories: oscarsDb.categories });
    }

    // 2. By Category (Year by year history of all 98 editions with winner AND nominees)
    if (categoryParam) {
      const catId = categoryParam.toLowerCase().trim();
      const meta = oscarsDb.categories.find((c) => c.id === catId);

      const winnersByYear: any[] = [];
      // Loop from most recent ceremony (98) down to 1
      for (let i = oscarsDb.editions.length - 1; i >= 0; i--) {
        const ed = oscarsDb.editions[i];
        const matchingCategory = ed.categories.find((c) => c.categoryId === catId);

        if (matchingCategory && matchingCategory.winner) {
          winnersByYear.push({
            ceremony: ed.ceremony,
            year: ed.year,
            yearRaw: ed.yearRaw,
            editionLabel: ed.editionLabel,
            categoryEs: matchingCategory.categoryEs,
            categoryIcon: matchingCategory.categoryIcon || "🏆",
            winner: matchingCategory.winner,
            nominees: matchingCategory.nominees || []
          });
        }
      }

      return NextResponse.json({
        category: meta || { id: catId, nameEs: categoryParam, icon: "🏆" },
        totalWinners: winnersByYear.length,
        winners: winnersByYear
      });
    }

    // 3. Search by term across all 98 editions
    if (queryParam && queryParam.trim()) {
      const q = queryParam.toLowerCase().trim();
      const matchedWinners: any[] = [];
      const matchedEditions: any[] = [];

      for (const ed of oscarsDb.editions) {
        let editionMatched = false;
        if (String(ed.year).includes(q) || String(ed.ceremony) === q) {
          editionMatched = true;
          matchedEditions.push({
            ceremony: ed.ceremony,
            year: ed.year,
            editionLabel: ed.editionLabel,
            bestPicture: ed.bestPicture
          });
        }

        for (const cat of ed.categories) {
          if (!cat.winner) continue;
          const matchFilm = (cat.winner.film || "").toLowerCase().includes(q);
          const matchName = (cat.winner.name || "").toLowerCase().includes(q);
          const matchCat = (cat.categoryEs || "").toLowerCase().includes(q);

          // Check nominees too
          const matchingNominee = cat.nominees?.find(
            (n) => n.film?.toLowerCase().includes(q) || n.name?.toLowerCase().includes(q)
          );

          if (matchFilm || matchName || matchCat || matchingNominee) {
            matchedWinners.push({
              ceremony: ed.ceremony,
              year: ed.year,
              editionLabel: ed.editionLabel,
              categoryEs: cat.categoryEs,
              categoryIcon: cat.categoryIcon,
              winner: cat.winner,
              nominees: cat.nominees || []
            });
          }
        }
      }

      return NextResponse.json({
        query: queryParam,
        matchedEditions,
        matchedWinners: matchedWinners.slice(0, 100),
        totalMatches: matchedWinners.length
      });
    }

    // 4. Default: Summary list of all 98 editions and categories
    const summaryList = oscarsDb.editions.map((e) => ({
      ceremony: e.ceremony,
      year: e.year,
      yearRaw: e.yearRaw,
      editionLabel: e.editionLabel,
      bestPicture: e.bestPicture,
      totalAwards: e.categories.length
    }));

    return NextResponse.json({
      totalEditions: oscarsDb.totalEditions,
      categories: oscarsDb.categories,
      editions: summaryList
    });
  } catch (err: any) {
    console.error("Oscars API Error:", err);
    return NextResponse.json({ error: "Error al procesar la solicitud de premios", details: err.message }, { status: 500 });
  }
}
