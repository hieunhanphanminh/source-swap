// Compatibility shim so legacy react-router-dom call-sites work atop TanStack Router.
import { forwardRef } from "react";
import {
  Link as TLink,
  useNavigate as tUseNavigate,
  useLocation as tUseLocation,
} from "@tanstack/react-router";

type LinkProps = React.AnchorHTMLAttributes<HTMLAnchorElement> & {
  to: string;
  replace?: boolean;
};

export const Link = forwardRef<HTMLAnchorElement, LinkProps>(function Link(
  { to, children, ...rest },
  ref,
) {
  return (
    <TLink ref={ref as never} to={to as never} {...(rest as Record<string, unknown>)}>
      {children}
    </TLink>
  );
});

export function useNavigate() {
  const nav = tUseNavigate();
  return (path: string) => nav({ to: path as never });
}

export const useLocation = tUseLocation;
