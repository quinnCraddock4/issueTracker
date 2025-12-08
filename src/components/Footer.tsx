function Footer() {
  const currentYear = new Date().getFullYear();
  return (
    <footer className="bg-gray-900 text-white p-2">
      &copy; Quinn Craddock {currentYear}
    </footer>
  );
}

export default Footer;
