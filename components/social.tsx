// https://github.com/couetilc/react-social-icons/tree/main/db
export const paths = {
  blog: "M 16.000057 16.000057 L 16.000057 48.000171 L 48.000171 48.000171 L 48.000171 16.000057 L 16.000057 16.000057 z M 16.999996 16.999996 L 32.000114 16.999996 L 47.000232 16.999996 L 47.000232 20.21427 L 47.000232 23.428544 L 43.785958 23.428544 L 40.571167 23.428544 L 40.571167 32.000114 L 40.571167 40.571684 L 43.785958 40.571684 L 47.000232 40.571684 L 47.000232 43.785958 L 47.000232 47.000232 L 40.571167 47.000232 L 34.142619 47.000232 L 34.142619 35.214388 L 34.142619 23.428544 L 32.000114 23.428544 L 29.857092 23.428544 L 29.857092 35.214388 L 29.857092 47.000232 L 23.428544 47.000232 L 16.999996 47.000232 L 16.999996 43.785958 L 16.999996 40.571684 L 20.21427 40.571684 L 23.428544 40.571684 L 23.428544 32.000114 L 23.428544 23.428544 L 20.21427 23.428544 L 16.999996 23.428544 L 16.999996 20.21427 L 16.999996 16.999996 z ",
  github:
    "M0 0v64h64V0zm37.1 47.2c-.8.2-1.1-.3-1.1-.8V42c0-1.5-.5-2.5-1.1-3 3.6-.4 7.3-1.7 7.3-7.9 0-1.7-.6-3.2-1.6-4.3.2-.4.7-2-.2-4.2 0 0-1.3-.4-4.4 1.6-1.3-.4-2.6-.5-4-.5s-2.7.2-4 .5c-3.1-2.1-4.4-1.6-4.4-1.6-.9 2.2-.3 3.8-.2 4.2-1 1.1-1.6 2.5-1.6 4.3 0 6.1 3.7 7.5 7.3 7.9-.5.4-.9 1.1-1 2.1-.9.4-3.2 1.1-4.7-1.3 0 0-.8-1.5-2.5-1.6 0 0-1.6 0-.1 1 0 0 1 .5 1.8 2.3 0 0 .9 3.1 5.4 2.1v2.7c0 .4-.3.9-1.1.8-6.3-2-10.9-8-10.9-15.1 0-8.8 7.2-16 16-16s16 7.2 16 16c0 7.1-4.6 13.1-10.9 15.2",
  linkedin:
    "M0 0v64h64V0zm25.8 44h-5.4V26.6h5.4zm-2.7-19.7c-1.7 0-3.1-1.4-3.1-3.1s1.4-3.1 3.1-3.1 3.1 1.4 3.1 3.1-1.4 3.1-3.1 3.1M46 44h-5.4v-8.4c0-2 0-4.6-2.8-4.6s-3.2 2.2-3.2 4.5V44h-5.4V26.6h5.2V29h.1c.7-1.4 2.5-2.8 5.1-2.8 5.5 0 6.5 3.6 6.5 8.3V44z",
  twitter:
    "M0 0v64h64V0zm16 17.537h10.125l6.992 9.242 8.084-9.242h4.908L35.39 29.79 48 46.463h-9.875l-7.734-10.111-8.85 10.11h-4.908l11.465-13.105zm5.73 2.783 17.75 23.205h2.72L24.647 20.32z",
};

export default function Component({
  kind,
  className,
  href,
}: {
  kind: "blog" | "github" | "linkedin" | "twitter";
  className: string;
  href: string;
}) {
  return (
    <a target="_blank" rel="noopener noreferrer" href={href}>
      <div className={className}>
        <span className="sr-only">{kind}</span>
        <div className="w-8 h-8">
          <svg
            className="bg-black fill-white dark:bg-white dark:fill-black"
            role="img"
            viewBox="16 16 32 32"
            xmlns="http://www.w3.org/2000/svg"
          >
            <title>{`${kind} icon`}</title>
            <path d={paths[kind]} />
          </svg>
        </div>
      </div>
    </a>
  );
}
