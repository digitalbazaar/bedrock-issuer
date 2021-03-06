# bedrock-issuer ChangeLog

## 1.2.2 - 2017-04-04

### Changed
- Modify jsonld frame to allow same `issuer` and `claim.id`.

## 1.2.1 - 2016-11-14

### Fixed
- Fix failure in `issue` API when actor is null.

## 1.2.0 - 2016-10-11

### Added
- Emit a CredentialIssue event after issuing a credential.

## 1.1.0 - 2016-09-21

### Added
- Add ability to include custom meta data via `issue` API. Not
  yet available via HTTP API.

## Changed
- Restructure test framework for CI.

## 1.0.8 - 2016-08-03

### Fixed
- Create error if the private key is not returned.

## 1.0.7 - 2016-07-26

### Fixed
- Handle framing error.

## 1.0.6 - 2016-07-22

### Changed
- Frame and compact incoming credentials to issuer service.
- Add helper code to remove unneeded blank nodes.

## 1.0.5 - 2016-07-20

### Changed
- Check signing key status before signing.

## 1.0.4 - 2016-07-12

### Changed
- Remove bedrock.credential.issuer role from config.

## 1.0.3 - 2016-06-07

### Changed
- Update dependencies.

## 1.0.2 - 2016-05-30

### Fixed
- Fix typos.

## 1.0.1 - 2016-05-30

### Changed
- Update dependencies.

## 1.0.0 - 2106-05-25

### Added
- Sign credentials with a preferred key.

## 0.3.4 - 2016-04-29

## 0.3.3 - 2016-04-26

## 0.3.2 - 2016-04-15

### Changed
- Update bedrock dependencies.

## 0.3.1 - 2016-03-11

### Changed
- Change signing key variables.

## 0.3.0 - 2016-03-03

### Changed
- Update package dependencies for npm v3 compatibility.

## 0.2.1 - 2016-02-23

### Changed
- Improved key test docs.
- Use a real image for key test credential.

## 0.2.0 - 2016-02-05

### Added
- Add demo command line issuer.
- Return issued credential.
- Use key module.

## 0.1.0 - 2016-01-31

- See git history for changes.
