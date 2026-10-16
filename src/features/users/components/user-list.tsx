import Link from "next/link";
import type { User } from "@/features/users/types/user.types";

export default function UserList({ users }: { users: User[] }) {
	if (users.length === 0) {
		return <p className="text-secondary mb-0">No users found.</p>;
	}

	return (
		<div className="table-responsive">
			<table className="table align-middle mb-0">
				<thead>
					<tr>
						<th scope="col">Photo</th>
						<th scope="col">Name</th>
						<th scope="col">Email</th>
						<th className="text-end" scope="col">Action</th>
					</tr>
				</thead>
				<tbody>
					{users.map((user) => (
						<tr key={user.id}>
							<td>
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
							<td>{user.firstName} {user.lastName}</td>
							<td>{user.email}</td>
							<td className="text-end">
								<Link className="btn btn-sm btn-outline-primary" href={`/user/${encodeURIComponent(user.id)}`}>View</Link>
							</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
}
