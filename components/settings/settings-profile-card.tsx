import Image from "next/image";
import { MaterialIcon } from "@/components/crm/material-icon";

const AVATAR_SRC =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuD5rDxxIT3zMqeLdFfzExVr7dfpA79wE1YoryjmfqKroHB5ngZHRQ3yPCkjO9J2yejn4C5uyr8uVVPNewrpWMj6hpPBukOScaGArAnmQt4eyyyhfD7GAx-GC1nVyAt7u-qT92cZq_FMVdTQemvGmxhdVzCoa3g-yumdxchxE5TEIgsC87w-iQ1uzvjkTLiDQGlwwBDnHQLMxc7H3kJJRVJrDz1qLxJUkXCxJFdN2RAkoYmCC_OUxYYJwItY30IDBBoIo0EM4k6D4JdK";

export function SettingsProfileCard() {
  return (
    <section className="overflow-hidden rounded-xl border border-outline-variant/10 bg-surface-container">
      <div className="relative h-24 bg-gradient-to-r from-primary/20 via-primary-container/10 to-transparent">
        <div className="absolute -bottom-8 left-6">
          <Image
            src={AVATAR_SRC}
            alt=""
            width={64}
            height={64}
            className="h-16 w-16 rounded-xl border-4 border-surface-container object-cover shadow-lg"
          />
        </div>
      </div>
      <div className="px-6 pb-6 pt-12">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="font-headline text-lg font-bold text-on-surface">Admin User</h2>
            <p className="text-xs text-on-surface-variant">admin@securicorp.io · System Overseer</p>
          </div>
          <button
            type="button"
            className="flex items-center gap-1.5 self-start rounded-lg border border-outline-variant/20 px-4 py-2 text-xs font-bold text-on-surface-variant transition-all hover:border-primary/30 hover:text-primary"
          >
            <MaterialIcon name="edit" className="text-[14px]" />
            Edit profile
          </button>
        </div>
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-lg bg-surface-container-low p-4">
            <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Role</span>
            <p className="mt-1 text-sm font-semibold text-on-surface">Administrator</p>
          </div>
          <div className="rounded-lg bg-surface-container-low p-4">
            <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Region</span>
            <p className="mt-1 text-sm font-semibold text-on-surface">West Coast</p>
          </div>
          <div className="rounded-lg bg-surface-container-low p-4">
            <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Joined</span>
            <p className="mt-1 text-sm font-semibold text-on-surface">Jan 2023</p>
          </div>
        </div>
      </div>
    </section>
  );
}
