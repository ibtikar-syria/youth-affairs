type SiteFooterProps = {
  organizationName?: string
  slogan?: string
}

export const SiteFooter = ({
  organizationName = 'شؤون الشباب',
  slogan = 'جيل شبابي متمكّن وواعٍ',
}: SiteFooterProps) => (
  <footer className="bg-primary py-8 text-white">
    <div className="mx-auto max-w-6xl px-4 text-sm">
      <p>
        {organizationName} — {slogan}
      </p>
    </div>
  </footer>
)