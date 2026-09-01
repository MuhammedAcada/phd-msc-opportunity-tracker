# LinkedIn Boolean Search Bank

Use these manually in LinkedIn's main search bar, then filter to **Posts** or **People**.

LinkedIn supports uppercase `AND`, `OR`, `NOT`, exact phrases in `"quotes"`, and parentheses. It does not officially support `*` wildcards, square brackets, braces, or angle brackets. Keep searches modular because free LinkedIn search can limit very long Boolean strings.

## Fast Daily Searches - Posts

### 1. Medicinal Chemistry PhD/MSc Openings

```text
("PhD position" OR "PhD opportunity" OR "PhD studentship" OR "doctoral position") AND ("medicinal chemistry" OR "drug discovery" OR "chemical biology") AND (funded OR "fully funded" OR studentship)
```

### 2. Computational Drug Discovery

```text
("PhD position" OR "PhD opportunity" OR "doctoral researcher") AND ("computational drug discovery" OR "computer-aided drug design" OR "molecular docking" OR ADMET)
```

### 3. Natural Products and Metabolomics

```text
("PhD position" OR "graduate student" OR "master's student") AND ("natural product chemistry" OR metabolomics OR phytochemistry OR "mass spectrometry")
```

### 4. Neglected Tropical Diseases / Parasitology

```text
("PhD position" OR "doctoral position" OR "graduate student") AND (leishmaniasis OR "neglected tropical disease" OR antiparasitic OR parasitology) AND ("drug discovery" OR "medicinal chemistry")
```

### 5. Health Informatics / Digital Health

```text
("PhD position" OR "MSc" OR "master's student" OR "graduate student") AND ("health informatics" OR "digital health" OR "clinical informatics" OR "public health informatics")
```

### 6. AI for Health / Health Data Engineering

```text
("PhD position" OR "graduate student" OR "research assistant") AND ("AI for health" OR "machine learning for healthcare" OR "health data" OR "data engineering") AND (healthcare OR pharmacy OR "supply chain")
```

### 7. Professor Hiring Student Posts

```text
("I am looking for" OR "we are looking for" OR "join my lab" OR "join our lab") AND ("PhD student" OR "master's student" OR "graduate student") AND ("drug discovery" OR "medicinal chemistry" OR "health informatics" OR "digital health")
```

### 8. New Lab / Funded Project Signals

```text
("fully funded" OR funded OR scholarship OR studentship) AND ("PhD" OR "MSc" OR "master's") AND ("drug discovery" OR "health informatics" OR "computational chemistry" OR "digital health")
```

## Targeted University Searches - Posts

### Oxford

```text
("University of Oxford" OR Oxford) AND ("PhD position" OR "DPhil" OR "graduate student" OR "studentship") AND ("medicinal chemistry" OR "computational chemistry" OR "chemical biology" OR "drug discovery")
```

```text
("University of Oxford" OR Oxford) AND ("health informatics" OR "digital health" OR "AI for health" OR "health data") AND ("PhD" OR "DPhil" OR "MSc")
```

### University of Toronto

```text
("University of Toronto" OR UofT OR "U of T") AND ("PhD position" OR "graduate student" OR "MSc student") AND ("health informatics" OR "digital health" OR "AI in healthcare" OR "health data")
```

```text
("University of Toronto" OR UofT OR "U of T") AND ("PhD position" OR "graduate student") AND ("medicinal chemistry" OR "drug discovery" OR "chemical biology" OR pharmacology)
```

### University of Michigan

```text
("University of Michigan" OR "Michigan Medicine" OR UMich) AND ("PhD position" OR "graduate student" OR "research assistant") AND ("health informatics" OR "learning health systems" OR "clinical informatics")
```

```text
("University of Michigan" OR UMich) AND ("PhD position" OR "graduate student") AND ("medicinal chemistry" OR "drug discovery" OR "computational chemistry")
```

### Cambridge

```text
("University of Cambridge" OR Cambridge) AND ("PhD position" OR "PhD studentship" OR "graduate student") AND ("medicinal chemistry" OR "chemical biology" OR "drug discovery" OR "computational chemistry")
```

```text
("University of Cambridge" OR Cambridge) AND ("health informatics" OR "digital health" OR "AI for health" OR "health data") AND ("PhD" OR "MPhil" OR studentship)
```

## Professor / Lab Discovery - People

Use these in **People** search, then add school filters manually.

### Medicinal Chemistry Professors

```text
("Professor of Medicinal Chemistry" OR "Associate Professor of Medicinal Chemistry" OR "Assistant Professor of Medicinal Chemistry" OR "Medicinal Chemistry Professor")
```

### Drug Discovery / Chemical Biology Professors

```text
("Professor" OR "Associate Professor" OR "Assistant Professor") AND ("drug discovery" OR "chemical biology" OR "chemical genetics")
```

### Computational Chemistry / Molecular Modelling Professors

```text
("Professor" OR "Associate Professor" OR "Assistant Professor") AND ("computational chemistry" OR "molecular modelling" OR "molecular dynamics" OR "computer-aided drug design")
```

### Health Informatics Professors

```text
("Professor" OR "Associate Professor" OR "Assistant Professor") AND ("health informatics" OR "clinical informatics" OR "public health informatics" OR "digital health")
```

### AI for Health / Health Data Professors

```text
("Professor" OR "Associate Professor" OR "Assistant Professor") AND ("AI for health" OR "machine learning for healthcare" OR "health data science" OR "biomedical informatics")
```

## Student Networking - People

Use **People** search and filter by school.

### Current PhD Students

```text
("PhD student" OR "Doctoral student" OR "DPhil student") AND ("medicinal chemistry" OR "drug discovery" OR "chemical biology" OR "computational chemistry")
```

```text
("PhD student" OR "Doctoral student") AND ("health informatics" OR "digital health" OR "AI for health" OR "biomedical informatics")
```

### MSc / MPhil Students

```text
("MSc student" OR "Master's student" OR "MPhil student") AND ("medicinal chemistry" OR "drug discovery" OR "computational chemistry" OR "health informatics")
```

### Nigerian / African Students in Target Fields

```text
(Nigeria OR Nigerian OR Africa OR African) AND ("PhD student" OR "MSc student" OR "graduate student") AND ("medicinal chemistry" OR "drug discovery" OR "health informatics" OR "digital health")
```

## Search Rotation

Run these manually every day:

1. Posts: Professor Hiring Student Posts
2. Posts: Medicinal Chemistry PhD/MSc Openings
3. Posts: Health Informatics / Digital Health
4. People: Health Informatics Professors with school filter
5. People: Medicinal Chemistry Professors with school filter
6. People: Current PhD Students with school filter

Run these twice weekly:

1. Posts: Neglected Tropical Diseases / Parasitology
2. Posts: Computational Drug Discovery
3. Posts: AI for Health / Health Data Engineering
4. Posts: Targeted University Searches

## Manual Capture Rule

For every promising LinkedIn result, copy the post/profile URL and add it to the tracker as:

- Source: LinkedIn manual
- Lead type: Professor post, Student contact, Lab page, PhD advert, MSc funding, or Other
- Evidence snippet: paste only a short human-readable note, not a full scraped post
- Next action: Cold email, LinkedIn message, Find email, Read lab page, Draft SOP, or Follow up

This keeps LinkedIn human-in-the-loop and avoids account-risky automation.
