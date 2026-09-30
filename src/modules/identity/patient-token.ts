/** The decoded JWT payload attached to `request.patient` by `PatientJwtAuthGuard`. Signed with
 * `SESSION_JWT_SECRET` — a separate secret and a separate `JwtModule` registration from staff's
 * (`STAFF_JWT_SECRET`, in `CommonAuthModule`), so a leaked patient token can never be replayed
 * against an operations-console route or vice versa. */
export interface PatientTokenPayload {
  sub: string;
  email: string;
}
