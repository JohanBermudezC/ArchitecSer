export const PASSWORD_POLICY_TEXT =
  "Minimo 10 caracteres, con mayuscula, minuscula, numero y caracter especial.";

const PASSWORD_REQUIREMENTS = [
  {
    label: "minimo 10 caracteres",
    test: (password) => password.length >= 10,
  },
  {
    label: "una letra mayuscula",
    test: (password) => /[A-Z]/.test(password),
  },
  {
    label: "una letra minuscula",
    test: (password) => /[a-z]/.test(password),
  },
  {
    label: "un numero",
    test: (password) => /[0-9]/.test(password),
  },
  {
    label: "un caracter especial",
    test: (password) => /[^A-Za-z0-9]/.test(password),
  },
];

export function getPasswordPolicyErrors(password) {
  return PASSWORD_REQUIREMENTS.filter(
    (requirement) => !requirement.test(password),
  ).map((requirement) => requirement.label);
}

export function getPasswordPolicyMessage(password) {
  const missingRequirements = getPasswordPolicyErrors(password);

  if (missingRequirements.length === 0) return "";

  return `La contrasena debe incluir ${missingRequirements.join(", ")}.`;
}

export function isPasswordPolicyValid(password) {
  return getPasswordPolicyErrors(password).length === 0;
}

export function getPasswordStrength(password) {
  const metRequirements =
    PASSWORD_REQUIREMENTS.length - getPasswordPolicyErrors(password).length;

  if (!password) return { score: 0, label: "", color: "#e5e5e5" };
  if (metRequirements <= 2) {
    return { score: metRequirements, label: "Debil", color: "#ef4444" };
  }
  if (metRequirements <= 4) {
    return { score: metRequirements, label: "Media", color: "#f59e0b" };
  }

  return { score: metRequirements, label: "Fuerte", color: "#22c55e" };
}
