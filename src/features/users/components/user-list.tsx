import { formatDateTime } from "@/lib/date-time";
import Link from "next/link";
import type { PagedUsers } from "@/features/users/types/user.types";
import AdminUserControls from "@/features/users/components/admin-user-controls";

export default function UserList({ users, currentUserId }: { users: PagedUsers; currentUserId: string }) {
	if (users.items.length === 0) {
		return <p className="text-secondary mb-0">No users found.</p>;
	}

	return (
		<>
		<div className="table-responsive">
			<table role="table" className="table align-middle mb-0" data-coral-table="users">
				<thead role="rowgroup">
					<tr role="row">
						<th role="columnheader" scope="col">Photo</th>
						<th role="columnheader" scope="col">Name</th>
						<th role="columnheader" scope="col">Email</th>
							<th role="columnheader" scope="col">Role</th>
							<th role="columnheader" scope="col">Status</th>
							<th role="columnheader" scope="col">Last sign in</th>
						<th role="columnheader" className="text-end" scope="col">Action</th>
					</tr>
				</thead>
				<tbody role="rowgroup">
					{users.items.map((user) => (
						<tr role="row" key={user.id}>
							<td role="cell" data-label="Photo">
								{user.imageUrl ? (
									<>
										{/* eslint-disable-next-line @next/next/no-img-element */}
										<img
											className="profile-image-thumbnail rounded border"
											src={user.imageUrl}
											alt={`${user.firstName} ${user.lastName}`}
										/>
									</>
								) : (
									<div className="profile-image-thumbnail rounded border bg-light" aria-label="No profile picture" role="img" />
								)}
							</td>
							<td role="cell" data-label="Name">{user.firstName} {user.lastName}</td>
							<td role="cell" data-label="Email">{user.email}</td>
								<td role="cell" data-label="Role">{user.role}</td>
								<td role="cell" data-label="Status"><span className={`badge ${user.status === "Active" ? "text-bg-success" : "text-bg-secondary"}`}>{user.status}</span>{user.isLockedOut && <span className="badge text-bg-warning ms-1">Locked</span>}</td>
							<td role="cell" data-label="Last sign in">{user.lastSignInOn ? formatDateTime(user.lastSignInOn) : "Never"}</td>
							<td role="cell" className="text-end" data-label="Action">
									<div className="d-flex flex-wrap justify-content-end align-items-start gap-2"><Link className="btn btn-sm btn-outline-primary" href={`/user/${encodeURIComponent(user.id)}`}>View</Link><AdminUserControls user={user} currentUserId={currentUserId} /></div>
							</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
		<nav className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-2 mt-3" aria-label="User list pagination">
			<span className="text-secondary">Page {users.page} of {users.totalPages}; {users.totalCount} users</span>
			<div className="btn-group">
				<Link className={`btn btn-outline-primary${users.page <= 1 ? " disabled" : ""}`} href={`/users?page=${Math.max(1, users.page - 1)}`} aria-disabled={users.page <= 1}>Previous</Link>
				<Link className={`btn btn-outline-primary${users.page >= users.totalPages ? " disabled" : ""}`} href={`/users?page=${Math.min(users.totalPages, users.page + 1)}`} aria-disabled={users.page >= users.totalPages}>Next</Link>
			</div>
		</nav>
		</>
	);
}
