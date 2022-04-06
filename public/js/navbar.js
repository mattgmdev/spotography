const currentPath = location.href
const navLinks = document.querySelectorAll(".nav-link")
const navLinksLength = navLinks.length

for (let i = 0; i < navLinksLength; i++) {
  if (navLinks[i].href === currentPath) {
    navLinks[i].className = "nav-link active"
  } else {
    navLinks[i].className = "nav-link"
  }
}
