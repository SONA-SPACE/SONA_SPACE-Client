import { useEffect, useMemo, useState } from "react";
import { getAllCategories } from "../../api/category";
import { getAllRooms } from "../../api/room";
import type { Category, Room } from "../../types";

export type HeaderCatalog = {
  categories: Category[];
  rooms: Room[];
  loadingCategories: boolean;
  loadingRooms: boolean;
};

// Categories and rooms feed the mega menus, search panel and mobile menu.
export function useHeaderCatalog(): HeaderCatalog {
  const [categories, setCategories] = useState<Category[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loadingRooms, setLoadingRooms] = useState(true);

  useEffect(() => {
    let active = true;

    getAllCategories()
      .then((data) => active && setCategories(data))
      .catch(() => undefined)
      .finally(() => active && setLoadingCategories(false));

    getAllRooms()
      .then((data) => active && setRooms(data))
      .catch(() => undefined)
      .finally(() => active && setLoadingRooms(false));

    return () => {
      active = false;
    };
  }, []);

  const sortedCategories = useMemo(
    () =>
      [...categories].sort(
        (a, b) => (a.category_priority || 999) - (b.category_priority || 999)
      ),
    [categories]
  );

  return { categories: sortedCategories, rooms, loadingCategories, loadingRooms };
}
