  const Badges = ({ readmeContent }) => {
    const badgeRegex = /!\[[^\]]*\]\(([^)]+)\)/g;
    const badges = [...readmeContent.matchAll(badgeRegex)].map(match => match[1]);

    if (badges.length === 0) {
      return null;
    }

    return (
      <div className="mt-6">
          <h3 className="font-bold text-lg mb-2">Project Badges</h3>
          <div className="flex flex-wrap gap-2">
              {badges.map((badgeUrl, index) => (
                  <img key={index} src={badgeUrl} alt="Project Badge" className="h-6" />
              ))}
          </div>
      </div>
    );
  };

  export default Badges;
